using System;

public class RentModel
{
    public string Name { get; set; }
    public string Email { get; set; }
    public Vehicle Vehicle { get; set; }
    public DateTime Date { get; set; }
}

public class Vehicle
{
    public string Model { get; set; }
    public string Year { get; set; }
    public string RentPeriod { get; set; }
}