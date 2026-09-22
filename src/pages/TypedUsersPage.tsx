import { useParams } from 'react-router-dom';
import SystemUsersPage from './SystemUsersPage';

export default function TypedUsersPage() {
  const { userType = '' } = useParams();
  return <SystemUsersPage key={userType} accountType={userType} />;
}
