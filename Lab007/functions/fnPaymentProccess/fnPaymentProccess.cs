using System;
using System.Threading.Tasks;
using Azure.Messaging.ServiceBus;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Functions.Worker.Extensions.CosmosDB;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using RentaCar.Payment.Model;

namespace RentaCar.Payment;

public class FnPaymentProccess(ILogger<FnPaymentProccess> logger, IConfiguration configuration)
{
    private readonly ILogger<FnPaymentProccess> _logger = logger;
    private readonly IConfiguration _configuration = configuration;
    private readonly string[] StatusList = ["Approved", "Rejected", "Pending"];
    private readonly Random _random = new();

    [Function(nameof(FnPaymentProccess))]
    [CosmosDBOutput("%CosmosDb%", "%CosmosContainer%", Connection = "CosmosDBConnection", CreateIfNotExists = true)]
    public async Task<object?> Run(
        [ServiceBusTrigger("%PaymentsQueue%", Connection = "ServiceBusConnection")]
        ServiceBusReceivedMessage message,
        ServiceBusMessageActions messageActions)
    {
        _logger.LogInformation("Message ID: {id}", message.MessageId);
        _logger.LogInformation("Message Body: {body}", message.Body);
        _logger.LogInformation("Message Content-Type: {contentType}", message.ContentType);

        PaymentModel? payment = null;
        try
        {
            payment = JsonSerializer.Deserialize<PaymentModel>(message.Body.ToString(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (payment == null)
            {
                await messageActions.DeadLetterMessageAsync(
                    message,
                    deadLetterReason: "DeserializationError",
                    deadLetterErrorDescription: "Failed to deserialize the message body to PaymentModel");
                return null;
            }

            int index = _random.Next(StatusList.Length);
            string status = StatusList[index];
            payment.Status = status;

            if (status == "Approved")
            {
                payment.AprovedDate = DateTime.UtcNow;
                await SendToNotificationQueue(payment);
            }

            await messageActions.CompleteMessageAsync(message);
            return payment;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error occurred while processing the message");
            await messageActions.DeadLetterMessageAsync(
                message,
                deadLetterReason: "DeserializationError",
                deadLetterErrorDescription: $"Failed to deserialize the message body to PaymentModel: {ex.Message}");
            return null;
        }
    }

    private async Task SendToNotificationQueue(PaymentModel payment)
    {
        string connectionString = _configuration["ServiceBusConnection"]
            ?? throw new InvalidOperationException("ServiceBusConnection is not configured.");
        string queueName = _configuration["NotificationsQueue"]
            ?? throw new InvalidOperationException("NotificationsQueue is not configured.");

        await using var client = new ServiceBusClient(connectionString);
        ServiceBusSender sender = client.CreateSender(queueName);

        string messageBody = JsonSerializer.Serialize(payment);
        ServiceBusMessage message = new(messageBody)
        {
            ContentType = "application/json",
        };

        message.ApplicationProperties.Add("IdPayment", payment.IdPayment);
        message.ApplicationProperties.Add("type", "notification");
        message.ApplicationProperties.Add("message", $"Payment for {payment.Vehicle.Model} has been {payment.Status}");

        try
        {
            await sender.SendMessageAsync(message);
            _logger.LogInformation("Message sent to NotificationsQueue with ID: {id}", message.MessageId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send message to NotificationsQueue");
            return;
        }
        finally
        {
            await sender.DisposeAsync();
            await client.DisposeAsync();
        }
    }
}
