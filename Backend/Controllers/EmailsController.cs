using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CampusServicesPortal.Services.Interfaces;

namespace CampusServicesPortal.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/emails")]
    [Route("api/email")]
    public class EmailsController : BaseApiController
    {
        private readonly IEmailService _emailService;

        public EmailsController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        // GET /api/emails/preview/verification or /api/email/preview/verify-email — Render HTML verification email preview
        [HttpGet("preview/verification")]
        [HttpGet("preview/verify-email")]
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
