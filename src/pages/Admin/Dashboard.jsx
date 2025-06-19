
import AdminLayout from "./components/AdminLayout";
import Chart from "./components/Chart";
import OrdersList from "./components/DashboardOrderList";

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
