using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CampusServicesPortal.Data;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;

namespace CampusServicesPortal.Repositories.Implementations
{
    public class FeeTypeRepository : IFeeTypeRepository
    {
        private readonly AppDbContext _context;

        public FeeTypeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FeeType>> GetActiveFeeTypesAsync()
        {
            return await _context.FeeTypes.ToListAsync();
        }

        public async Task<FeeType?> GetFeeTypeByIdAsync(int id)
        {
            return await _context.FeeTypes.FindAsync(id);
        }

        public async Task AddFeeTypeAsync(FeeType feeType)
        {
            await _context.FeeTypes.AddAsync(feeType);
        }

        public void UpdateFeeType(FeeType feeType)
        {
            _context.FeeTypes.Update(feeType);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
