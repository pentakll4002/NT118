using System.Threading.Tasks;

namespace Backend.Services;

public interface IShipperTrackingSimulator
{
    void StartTrackingSimulation(long orderId);
}
