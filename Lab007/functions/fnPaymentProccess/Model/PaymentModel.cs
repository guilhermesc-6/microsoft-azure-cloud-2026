namespace RentaCar.Payment.Model;

public class PaymentModel
{
    public Guid id { get; set; } = Guid.NewGuid();
    public Guid IdPayment { get; set; } = Guid.NewGuid();
    public string Status { get; set; } = string.Empty;
    public DateTime? AprovedDate { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public VehicleModel Vehicle { get; set; } = new();
    public DateTime Date { get; set; }
}

public class VehicleModel
{
    public string Model { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public string RentPeriod { get; set; } = string.Empty;
}
