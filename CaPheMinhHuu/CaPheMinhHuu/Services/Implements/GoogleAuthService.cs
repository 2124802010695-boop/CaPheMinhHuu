using CaPheMinhHuu.Interfaces;
using Google.Apis.Auth;

namespace CaPheMinhHuu.Services.Implements
{
    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<GoogleAuthService> _logger;

        public GoogleAuthService(IConfiguration configuration, ILogger<GoogleAuthService> logger)
        {
            _configuration = configuration;
            _logger        = logger;
        }

        public async Task<GoogleUserPayload> ValidateAsync(string idToken)
        {
            var clientId = _configuration["GoogleAuth:ClientId"];

            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId }
            };

            GoogleJsonWebSignature.Payload payload;
            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            }
            catch (InvalidJwtException ex)
            {
                _logger.LogWarning("Google token validation failed: {Message}", ex.Message);
                throw new UnauthorizedAccessException("Google token không hợp lệ");
            }

            return new GoogleUserPayload
            {
                GoogleId = payload.Subject,
                Email    = payload.Email,
                Name     = payload.Name,
                Picture  = payload.Picture
            };
        }
    }
}
