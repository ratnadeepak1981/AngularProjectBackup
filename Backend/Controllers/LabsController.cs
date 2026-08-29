using CampusServicesPortal.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CampusServicesPortal.Controllers;

[ApiController]
[Route("api/labs")]
public class LabsController : ControllerBase
{
    private readonly ILabService _labService;

    public LabsController(ILabService labService)
    {
        _labService = labService;
    }

    // GET /api/labs - Anyone authenticated can view the directory list
    [HttpGet]
    public async Task<IActionResult> GetLabs()
    {
        var labs = await _labService.GetAllLabsAsync();
        return Ok(labs);
    }

    // POST /api/labs - Rule 4: Admin role authorization guard enforced server-side
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateLab([FromBody] CreateLabRequest request)
    {
        var success = await _labService.CreateLabAsync(request.Name, request.LabType, request.Capacity);
        if (!success) return BadRequest("Unable to instantiate laboratory profile.");
        return StatusCode(201); // 201 Created
    }

    // POST /api/labs/{id}/seats - Admin only layout configuration setup
    [HttpPost("{id}/seats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddSeat(int id, [FromBody] AddSeatRequest request)
    {
        try
        {
            var success = await _labService.AddSeatToLabAsync(id, request.SeatNumber);
            return success ? Ok() : BadRequest("Failed to register physical workstation seat.");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message); // Properly bubbles up validation rule blocks
        }
    }

    // DELETE /api/labs/{id}/seats/{seatId} - Rule 8: Intercepts if active dependencies exist
    [HttpDelete("{id}/seats/{seatId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveSeat(int id, int seatId)
    {
        try
        {
            var success = await _labService.RemoveSeatFromLabAsync(id, seatId);
            return success ? Ok() : BadRequest("Unable to remove physical seat structure.");
        }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }
}

// Request contracts scoped locally to clean up the controller signature 
public record CreateLabRequest(string Name, string LabType, int Capacity);
public record AddSeatRequest(string SeatNumber);
