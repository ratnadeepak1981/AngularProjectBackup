using CampusServicesPortal.DTOs.Requests.Labs;
using CampusServicesPortal.DTOs.Requests.Nortifcation;
using CampusServicesPortal.DTOs.Responses.Labs;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Implementations;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace CampusServicesPortal.Services.Implementations;

public class LabBookingService : ILabBookingService
{
    private readonly ILabRepository _labRepo;
    private readonly ILabBookingRepository _bookingRepo;
    private readonly IConfiguration _config;
    private readonly INotificationService _notificationService;

    public LabBookingService(ILabRepository labRepo, ILabBookingRepository bookingRepo,INotificationService notificationService,IConfiguration config)
    {
        _labRepo = labRepo;
        _bookingRepo = bookingRepo;
        _config = config;
        _notificationService = notificationService; // Assigned service dependency
    }

    public async Task<IEnumerable<LabBookingResponseDto>> GetStudentBookingsAsync(int studentId)
    {
        var bookings = await _bookingRepo.GetStudentBookingsAsync(studentId);
        return bookings.Select(b => new LabBookingResponseDto
        {
            Id = b.Id,
            StudentId = b.StudentId,
            LabName = b.Lab?.Name ?? string.Empty,
            LabType = b.Lab?.LabType ?? string.Empty,

            // FIX: Changed from b.LabSeat?.SeatNumber to b.Seat?.SeatNumber
            SeatNumber = b.Seat?.SeatNumber,

            BookingDate = b.BookingDate,
            TimeSlot = b.TimeSlot,
            Status = b.Status,
            ExpiresAt = b.ExpiresAt
        });
    }


    // Maps directly to your updated grid layout DTO schema requirements
    public async Task<LabMatrixLayoutDto> GetLabLayoutMatrixAsync(int labId, DateTime date, string timeSlot)
    {
        var lab = await _labRepo.GetByIdAsync(labId);
        if (lab == null) throw new KeyNotFoundException("Laboratory structure not found.");

        var staticSeats = await _labRepo.GetSeatsByLabIdAsync(labId);
        var mappedSeatsList = new List<LabSeatStatusDto>();

        foreach (var seat in staticSeats)
        {
            string calculatedStatus = "Available";

            // If your physical seat model tracks maintenance/hardware faults, check it first
            if (seat.IsBroken)
            {
                calculatedStatus = "Broken";
            }
            else
            {
                // Enforce Rule 2 & 8: Intercept live database transaction states for this specific slot
                var activeBooking = await _bookingRepo.GetActiveBookingForSeatAsync(labId, seat.Id, date, timeSlot);
                if (activeBooking != null)
                {
                    // Map active state string strings to match your descriptive criteria options
                    calculatedStatus = activeBooking.Status.Equals("Held", StringComparison.OrdinalIgnoreCase)
                        ? "Held"
                        : "Occupied";
                }
            }

            mappedSeatsList.Add(new LabSeatStatusDto
            {
                Id = seat.Id,                   // Maps to your exact property field name
                SeatNumber = seat.SeatNumber,
                RowIndex = seat.RowIndex,       // Maps to your exact property field name
                ColumnIndex = seat.ColumnIndex, // Maps to your exact property field name
                Status = calculatedStatus
            });
        }

        return new LabMatrixLayoutDto
        {
            // Dynamically evaluate your bounding grid size for frontend canvas render setups
            TotalRows = mappedSeatsList.Any() ? mappedSeatsList.Max(s => s.RowIndex) : 0,
            TotalColumns = mappedSeatsList.Any() ? mappedSeatsList.Max(s => s.ColumnIndex) : 0,
            Seats = mappedSeatsList
        };
    }

    public async Task<LabBookingResponseDto> CreateReservationHoldAsync(CreateLabBookingDto requestDto)
    {
        using var transaction = await _bookingRepo.BeginSerializableTransactionAsync(); // Rule 2
        try
        {
            var lab = await _labRepo.GetByIdAsync(requestDto.LabId);
            if (lab == null) throw new KeyNotFoundException("Laboratory record not found.");

            if (lab.LabType.Equals("Computer", StringComparison.OrdinalIgnoreCase)) // Rule 8
            {
                if (!requestDto.SeatId.HasValue) throw new ArgumentException("Seat selection required for Computer Labs.");

                var activeBooking = await _bookingRepo.GetActiveBookingForSeatAsync(requestDto.LabId, requestDto.SeatId.Value, requestDto.BookingDate, requestDto.TimeSlot);
                if (activeBooking != null) throw new InvalidOperationException("The requested workstation seat is already occupied or held.");
            }
            else if (lab.LabType.Equals("Science", StringComparison.OrdinalIgnoreCase))
            {
                int activeCount = await _bookingRepo.GetActiveBookingsCountForSlotAsync(requestDto.LabId, requestDto.BookingDate, requestDto.TimeSlot);
                if (activeCount >= lab.Capacity) throw new InvalidOperationException("The requested session slot has reached max student capacity.");
            }

            int holdMinutes = _config.GetValue<int>("SystemSettings:ReservationHoldMinutes", 15);

            var newBooking = new LabBooking
            {
                LabId = requestDto.LabId,
                StudentId = requestDto.StudentId,
                SeatId = lab.LabType.Equals("Computer", StringComparison.OrdinalIgnoreCase) ? requestDto.SeatId : null,
                BookingDate = requestDto.BookingDate.Date,
                TimeSlot = requestDto.TimeSlot,
                Status = "Held", // Set short-term reservation locking state code flag (Rule 12)
                ExpiresAt = DateTime.UtcNow.AddMinutes(holdMinutes)
            };

            await _bookingRepo.AddBookingAsync(newBooking);
            await _bookingRepo.SaveChangesAsync();
            await transaction.CommitAsync();

            return new LabBookingResponseDto
            {
                Id = newBooking.Id,
                StudentId = newBooking.StudentId,
                LabName = lab.Name,
                LabType = lab.LabType,
                SeatNumber = null,
                BookingDate = newBooking.BookingDate,
                TimeSlot = newBooking.TimeSlot,
                Status = newBooking.Status,
                ExpiresAt = newBooking.ExpiresAt
            };
        }
        catch { await transaction.RollbackAsync(); throw; }
    }

    public async Task<bool> ConfirmBookingAsync(int bookingId)
    {
        // 1. Fetch and validate the booking reference row parameters
        var booking = await _bookingRepo.GetByIdAsync(bookingId);
        if (booking == null || booking.Status != "Held" || booking.ExpiresAt < DateTime.UtcNow)
            return false;

        // 2. Stage the primary booking status change vector in context memory
        booking.Status = "Confirmed";

        try
        {
            // 3. AUTOMATED TRIGGER: Stage the notification alert model inside the shared memory pool [INDEX]
            // Maps cleanly to BRD Module 3 notification guidelines [INDEX]
            await _notificationService.SendInternalNotificationAsync(new CreateNotificationDto
            {
                StudentId = booking.StudentId, // Links cleanly to the authenticated student profile index [INDEX]
                Type = "LabBookingConfirmed",
                Message = $"Your temporary reservation request for Workstation #{booking.SeatId} has been successfully verified and confirmed for your slot."
            });

            // 4. ACID ATOMIC COMMIT [INDEX]
            // Persists BOTH the status transformation and the notification row inside one atomic SQL trip! [INDEX]
            return await _bookingRepo.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Critical database execution fault inside lab booking confirmation route: {ex.Message}");
            return false;
        }
    }


    public async Task<bool> CancelBookingAsync(int bookingId, int studentId)
    {
        var booking = await _bookingRepo.GetByIdAsync(bookingId);
        if (booking == null || booking.StudentId != studentId) return false; // Enforce owner safety constraints

        booking.Status = "Cancelled";
        return await _bookingRepo.SaveChangesAsync();
    }

    public async Task<IEnumerable<LabMinimalResponseDto>> GetAllLabsAsync()
    {
        var labs = await _labRepo.GetAllAsync();
        return labs.Select(l => new LabMinimalResponseDto
        {
            Id = l.Id,
            Name = l.Name,
            LabType = l.LabType,
            Capacity = l.Capacity
        });
    }

    public async Task ProcessExpiredHoldsAsync()
    {
        // 1. Open a transaction scope or use the context from your booking repository safely
        var expiredBookings = await _bookingRepo.GetExpiredHeldBookingsAsync();

        if (expiredBookings.Any())
        {
            foreach (var booking in expiredBookings)
            {
                booking.Status = "Expired"; // Transition state code matching Rule 12 requirements
            }
            await _bookingRepo.SaveChangesAsync();
        }
    }


}
