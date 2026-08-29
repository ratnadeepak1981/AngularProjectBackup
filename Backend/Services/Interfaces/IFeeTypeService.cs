using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.Models;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IFeeTypeService
    {
        Task<ServiceResult<IEnumerable<FeeType>>> GetFeeTypesAsync();
        Task<ServiceResult<FeeType>> CreateFeeTypeAsync(string name);
        Task<ServiceResult<FeeType>> UpdateFeeTypeAsync(int id, string name, bool isActive);
        Task<ServiceResult<object>> DeleteFeeTypeAsync(int id);
    }
}
