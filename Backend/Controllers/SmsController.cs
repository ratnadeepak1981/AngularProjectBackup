using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CampusServicesPortal.Services.Interfaces;

namespace CampusServicesPortal.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/sms")]
    public class SmsController : BaseApiController
    {
        private readonly ISmsService _smsService;

        public SmsController(ISmsService smsService)
        {
            _smsService = smsService;
        }

        // GET /api/sms/preview/forgot-password?email=ruwanbandara@univercity.co.lk — Render HTML SMS simulation preview in browser
        [HttpGet("preview/forgot-password")]
        public async Task<IActionResult> PreviewForgotPasswordSms([FromQuery] string email)
        {
            var result = await _smsService.GenerateForgotPasswordSmsPreviewAsync(email);
            if (!result.IsSuccess)
            {
                return ProcessServiceResult(result, "SMS preview generation failed.");
            }

            return Content(result.Data ?? string.Empty, "text/html");
        }
    }
}
