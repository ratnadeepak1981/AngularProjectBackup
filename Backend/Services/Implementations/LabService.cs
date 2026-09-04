using CampusServicesPortal.DTOs.Responses.Labs;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;

namespace CampusServicesPortal.Services.Implementations;

public class LabService : ILabService
{
    // Declared exactly once to resolve any compiler ambiguity errors
    private readonly ILabRepository _labRepo;

    public LabService(ILabRepository labRepo)
    {
        _labRepo = labRepo;
    }

    public async Task<bool> CreateLabAsync(string name, string labType, int capacity, int? totalRows = 4, int? totalColumns = 3)
    {
        int finalCapacity = capacity;
        if (labType.Equals("Computer", StringComparison.OrdinalIgnoreCase) && totalRows.HasValue && totalColumns.HasValue)
        {
            finalCapacity = totalRows.Value * totalColumns.Value;
        }

        var newLab = new Lab 
        { 
            Name = name, 
            LabType = labType, 
            Capacity = finalCapacity,
            TotalRows = totalRows ?? 4,
            TotalColumns = totalColumns ?? 3,
        };
        await _labRepo.AddLabAsync(newLab);
        return await _labRepo.SaveChangesAsync();
    }

    public async Task<bool> AddSeatToLabAsync(int labId, string seatNumber, int rowIndex = 1, int columnIndex = 1, string? equipmentDetails = null)
    {
        var lab = await _labRepo.GetByIdAsync(labId);
        if (lab == null)
            throw new KeyNotFoundException("Laboratory not found.");

        // Format seat number with LAB{labId}- prefix if not present
        string formattedSeatNumber = seatNumber;
        if (!seatNumber.StartsWith($"LAB{labId}-", StringComparison.OrdinalIgnoreCase))
        {
            formattedSeatNumber = $"LAB{labId}-{seatNumber}";
        }

        await _labRepo.AddSeatAsync(new LabSeat 
        { 
            LabId = labId, 
            SeatNumber = formattedSeatNumber,
            RowIndex = rowIndex,
            ColumnIndex = columnIndex,
        });
        return await _labRepo.SaveChangesAsync();
    }

    public async Task<bool> RemoveSeatFromLabAsync(int labId, int seatId)
    {
        var seats = await _labRepo.GetSeatsByLabIdAsync(labId);
        var targetSeat = seats.FirstOrDefault(s => s.Id == seatId);
        if (targetSeat == null)
            throw new KeyNotFoundException("Seat not found in this laboratory.");

        // Rule: A seat cannot be deleted while it has future active bookings
        bool hasBookings = await _labRepo.HasFutureBookingsForSeatAsync(seatId);
        if (hasBookings)
            throw new InvalidOperationException("Cannot remove workstation seat because it has pending future bookings.");

        await _labRepo.DeleteSeatAsync(targetSeat);
        return await _labRepo.SaveChangesAsync();
    }

   public async Task<IEnumerable<LabMinimalResponseDto>> GetAllLabsAsync()
    {
        var labs = await _labRepo.GetAllAsync();
        return labs.Select(l => new LabMinimalResponseDto
        {
            Id = l.Id,
            Name = l.Name,
            LabType = l.LabType,
            Capacity = l.Capacity,
            SeatsBuilt = l.Seats != null ? l.Seats.Count : 0
        });
    }

}
