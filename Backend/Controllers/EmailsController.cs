using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CampusServicesPortal.Services.Interfaces;

namespace CampusServicesPortal.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/email")]
    public class EmailsController : BaseApiController
    {
        private readonly IEmailService _emailService;

        public EmailsController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        // GET /api/email/preview/verification — Render HTML verification email preview
        [HttpGet("preview/verification")]
        public async Task<IActionResult> PreviewVerificationEmail([FromQuery] string email)
        {
            var result = await _emailService.GenerateVerificationEmailPreviewAsync(email);
            if (!result.IsSuccess)
            {
                return ProcessServiceResult(result, "Email preview generation failed.");
            }

            return Content(result.Data ?? string.Empty, "text/html");
        }
    }
}
