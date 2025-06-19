import AdminLayout from "../Admin/components/AdminLayout";
import Chart from "../Admin/components/Chart";
import OrdersList from "../Admin/components/DashboardOrderList";


export default function Dashboard() {
    return (
      <AdminLayout>
          <div>
              <Chart/>
              <OrdersList/>
          </div>
      </AdminLayout>
    );
  }