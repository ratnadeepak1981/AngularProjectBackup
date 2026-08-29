using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CampusServicesPortal.DTOs.Requests.Auth;
using CampusServicesPortal.Services.Interfaces;

namespace CampusServicesPortal.Controllers
{
    [AllowAnonymous]
    [Route("api/auth")]
    public class AuthController : BaseApiController
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // POST /api/auth/login — Authenticate credentials & issue token profile
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var result = await _authService.LoginAsync(request);
            return ProcessServiceResult(result, "Identity authenticated successfully. Tokens issued.");
        }

        // POST /api/auth/refresh-token — Rotates and issues a new JWT access token
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            var result = await _authService.RefreshTokenAsync(request);
            return ProcessServiceResult(result, "Access token refreshed successfully.");
        }

        // POST /api/auth/revoke-token — Revokes active refresh token
        [HttpPost("revoke-token")]
        public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequestDto request)
        {
            var result = await _authService.RevokeTokenAsync(request);
            return ProcessServiceResult(result, "Refresh token revoked successfully.");
        }
    }
}
