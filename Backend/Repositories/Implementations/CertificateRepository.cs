using CampusServicesPortal.Data;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CampusServicesPortal.Repositories.Implementations
{
    public class CertificateRepository : ICertificateRepository
    {
        private readonly AppDbContext _context;

        public CertificateRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> StudentExistsAsync(int studentId)
        {
            return await _context.Students
                .AnyAsync(s => s.Id == studentId);
        }

        public async Task<CertificateType?>
            GetCertificateTypeByIdAsync(int certificateTypeId)
        {
            return await _context.CertificateTypes
                .FirstOrDefaultAsync(
                    ct => ct.Id == certificateTypeId);
        }

        public async Task<CertificateRequest?>
            GetRequestByIdAsync(int requestId)
        {
            return await RequestQuery()
                .FirstOrDefaultAsync(cr => cr.Id == requestId);
        }

        public async Task<IEnumerable<CertificateRequest>>
            GetRequestsByStudentIdAsync(int studentId)
        {
            return await RequestQuery()
                .AsNoTracking()
                .Where(cr => cr.StudentId == studentId)
                .OrderByDescending(cr => cr.RequestedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<CertificateRequest>>
            GetRequestsAsync(string? status)
        {
            var query = RequestQuery()
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (status == "Ready for Collection")
                {
                    // Existing seed data uses ReadyForCollection.
                    // BRD uses Ready for Collection.
                    query = query.Where(cr =>
                        cr.Status == "Ready for Collection" ||
                        cr.Status == "ReadyForCollection");
                }
                else
                {
                    query = query.Where(cr => cr.Status == status);
                }
            }

            return await query
                .OrderByDescending(cr => cr.RequestedAt)
                .ToListAsync();
        }

        public async Task<bool> HasPendingDuplicateAsync(
            int studentId,
            int certificateTypeId)
        {
            return await _context.CertificateRequests
                .AnyAsync(cr =>
                    cr.StudentId == studentId &&
                    cr.CertificateTypeId == certificateTypeId &&
                    cr.Status == "Pending");
        }

        public async Task AddRequestAsync(
            CertificateRequest request)
        {
            await _context.CertificateRequests
                .AddAsync(request);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        private IQueryable<CertificateRequest> RequestQuery()
        {
            return _context.CertificateRequests
                .Include(cr => cr.Student)
                .Include(cr => cr.CertificateType);
        }
    }
}