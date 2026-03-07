using System;
using System.Linq.Expressions;
using System.Text.Json;
using System.Threading.Tasks;
using Azure.Messaging.ServiceBus;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualBasic;

namespace RentCar.fnSBRentProcess;

public class fnSBRentProcess
{
    private readonly ILogger<fnSBRentProcess> _logger;
    private readonly IConfiguration _configuration;

    public fnSBRentProcess(ILogger<fnSBRentProcess> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    [Function(nameof(fnSBRentProcess))]
    public async Task Run(
        [ServiceBusTrigger("queue-locacoes", Connection = "ServiceBusConnectionString")]
        ServiceBusReceivedMessage message,
        ServiceBusMessageActions messageActions)
    {
        _logger.LogInformation("Message ID: {id}", message.MessageId);
        var body = message.Body.ToString();
        _logger.LogInformation("Message Body: {body}", body);
        _logger.LogInformation("Message Content-Type: {contentType}", message.ContentType);

        RentModel? rentModel = null;
        try
        {
            rentModel = JsonSerializer.Deserialize<RentModel>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (rentModel is null)
            {
                _logger.LogError("Message bad format.");
                await messageActions.DeadLetterMessageAsync(message, null, "Message body could not be deserialized into RentModel.");
                return;
            }

            var connectionString = _configuration.GetConnectionString("SQLConnectionString");
            using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var command = new SqlCommand(@"INSERT INTO Locacao (Nome, Email, Modelo, Ano, TempoAluguel, Data) VALUES (@Name, @Email, @VehicleModel, @VehicleYear, @RentPeriod, @Date)", connection);
            command.Parameters.AddWithValue("@Name", rentModel.Name);
            command.Parameters.AddWithValue("@Email", rentModel.Email);
            command.Parameters.AddWithValue("@VehicleModel", rentModel.Vehicle.Model);
            command.Parameters.AddWithValue("@VehicleYear", rentModel.Vehicle.Year);
            command.Parameters.AddWithValue("@RentPeriod", rentModel.Vehicle.RentPeriod);
            command.Parameters.AddWithValue("@Date", rentModel.Date);



            var serviceBusConnection = _configuration["ServiceBusConnectionString"];
            var serviceBusQueue = _configuration["ServiceBusQueue"];

            if (!string.IsNullOrEmpty(serviceBusConnection) && !string.IsNullOrEmpty(serviceBusQueue))
            {
                await SendMessageToPay(serviceBusConnection, serviceBusQueue, rentModel);
            }
            else
            {
                _logger.LogError("ServiceBus configuration is missing.");
            }

            var rowsAffected = await command.ExecuteNonQueryAsync();
            connection.Close();

            await messageActions.CompleteMessageAsync(message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process message: {messageId}.", message.MessageId);
            await messageActions.DeadLetterMessageAsync(message, null, $"Failed to process message: {ex.Message}");
            return;
        }
    }

    private async Task SendMessageToPay(string serviceBusConnection, string serviceBusQueue, RentModel rentModel)
    {
        ServiceBusClient serviceBusClient = new ServiceBusClient(serviceBusConnection);
        ServiceBusSender serviceBusSender = serviceBusClient.CreateSender(serviceBusQueue);
        ServiceBusMessage message = new ServiceBusMessage(JsonSerializer.Serialize(rentModel));
        message.ContentType = "application/json";
        message.ApplicationProperties.Add("MessageType", "RentPayment");
        message.ApplicationProperties.Add("Name", rentModel.Name);
        message.ApplicationProperties.Add("Email", rentModel.Email);
        message.ApplicationProperties.Add("Vehicle", JsonSerializer.Serialize(rentModel.Vehicle));
        message.ApplicationProperties.Add("Date", rentModel.Date.ToString("yyyy-MM-ddTHH:mm:ss.fffffffK"));

        await serviceBusSender.SendMessageAsync(message);
    }
}