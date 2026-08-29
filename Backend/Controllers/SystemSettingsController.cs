using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CampusServicesPortal.Data;
using CampusServicesPortal.Models;
using Microsoft.EntityFrameworkCore;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/system-settings")]
    public class SystemSettingsController : BaseApiController
    {
        private readonly AppDbContext _context;

        public SystemSettingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/admin/system-settings/reservation-hold-minutes - BRD Page 12
        [HttpGet("reservation-hold-minutes")]
        public async Task<IActionResult> GetHoldMinutes()
        {
            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.SettingKey == "LabBookingHoldMinutes" || s.SettingKey == "reservation-hold-minutes");

            int minutes = setting != null && int.TryParse(setting.SettingValue, out var val) ? val : 15;
            return ProcessServiceResult(ServiceResult<object>.Success(new { HoldMinutes = minutes }, 200), "Reservation hold timeout setting retrieved.");
        }

        // PUT /api/admin/system-settings/reservation-hold-minutes - BRD Page 12
        [HttpPut("reservation-hold-minutes")]
        public async Task<IActionResult> UpdateHoldMinutes([FromBody] UpdateHoldMinutesDto request)
        {
            if (request.HoldMinutes <= 0)
                return BadRequest("Reservation hold duration must be at least 1 minute.");

            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.SettingKey == "LabBookingHoldMinutes");

            if (setting == null)
            {
                setting = new SystemSetting { SettingKey = "LabBookingHoldMinutes", SettingValue = request.HoldMinutes.ToString() };
                await _context.SystemSettings.AddAsync(setting);
            }
            else
            {
                setting.SettingValue = request.HoldMinutes.ToString();
                _context.SystemSettings.Update(setting);
            }

            await _context.SaveChangesAsync();
            return ProcessServiceResult(ServiceResult<object>.Success(new { Message = "Reservation hold timeout updated successfully.", HoldMinutes = request.HoldMinutes }, 200), "Reservation hold timeout setting updated.");
        }

        // GET /api/admin/system-settings/default-page-size
        [HttpGet("default-page-size")]
        public async Task<IActionResult> GetDefaultPageSize()
        {
            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.SettingKey == "DefaultPageSize");

            int pageSize = setting != null && int.TryParse(setting.SettingValue, out var val) ? val : 10;
            return ProcessServiceResult(ServiceResult<object>.Success(new { PageSize = pageSize }, 200), "Default pagination page size setting retrieved.");
        }

        // PUT /api/admin/system-settings/default-page-size
        [HttpPut("default-page-size")]
        public async Task<IActionResult> UpdateDefaultPageSize([FromBody] UpdatePageSizeDto request)
        {
            if (request.PageSize <= 0)
                return BadRequest("Page size must be greater than zero.");

            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.SettingKey == "DefaultPageSize");

            if (setting == null)
            {
                setting = new SystemSetting { SettingKey = "DefaultPageSize", SettingValue = request.PageSize.ToString() };
                await _context.SystemSettings.AddAsync(setting);
            }
            else
            {
                setting.SettingValue = request.PageSize.ToString();
                _context.SystemSettings.Update(setting);
            }

            await _context.SaveChangesAsync();
            return ProcessServiceResult(ServiceResult<object>.Success(new { Message = "System default page size updated successfully.", PageSize = request.PageSize }, 200), "Default pagination page size setting updated.");
        }
    }

    public record UpdateHoldMinutesDto(int HoldMinutes);
    public record UpdatePageSizeDto(int PageSize);
}
