using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.Models;

namespace CampusServicesPortal.Repositories.Interfaces
{
    public interface IFeeTypeRepository
    {
        Task<IEnumerable<FeeType>> GetActiveFeeTypesAsync();
        Task<FeeType?> GetFeeTypeByIdAsync(int id);
        Task AddFeeTypeAsync(FeeType feeType);
        void UpdateFeeType(FeeType feeType);
        Task SaveChangesAsync();
    }
}
