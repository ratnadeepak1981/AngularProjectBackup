using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CampusServicesPortal.Models;
using CampusServicesPortal.Services.Interfaces;

namespace CampusServicesPortal.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/fee-types")]
    public class FeeTypesController : BaseApiController
    {
        private readonly IFeeTypeService _feeTypeService;

        public FeeTypesController(IFeeTypeService feeTypeService)
        {
            _feeTypeService = feeTypeService;
        }

        // GET /api/fee-types - List all active fee types for student/admin
        [HttpGet]
        public async Task<IActionResult> GetFeeTypes()
        {
            var result = await _feeTypeService.GetFeeTypesAsync();
            return ProcessServiceResult(result, "Active fee types list retrieved successfully.");
        }

        // POST /api/fee-types - Admin create new fee type (BRD Page 15)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateFeeType([FromBody] CreateFeeTypeDto request)
        {
            var result = await _feeTypeService.CreateFeeTypeAsync(request.Name);
            return ProcessServiceResult(result, "Fee type created successfully.");
        }

        // PUT /api/fee-types/{id} - Admin amend fee type details (BRD Page 15)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateFeeType(int id, [FromBody] UpdateFeeTypeDto request)
        {
            var result = await _feeTypeService.UpdateFeeTypeAsync(id, request.Name, request.IsActive);
            return ProcessServiceResult(result, "Fee type updated successfully.");
        }

        // DELETE /api/fee-types/{id} - Admin soft-deactivate fee type (BRD Page 15)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteFeeType(int id)
        {
            var result = await _feeTypeService.DeleteFeeTypeAsync(id);
            return ProcessServiceResult(result, "Fee type soft-deactivated successfully.");
        }
    }

    public record CreateFeeTypeDto(string Name);
    public record UpdateFeeTypeDto(string Name, bool IsActive);
}
