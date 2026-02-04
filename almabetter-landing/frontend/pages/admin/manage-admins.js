import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import styles from '../../styles/ManageAdmins.module.css';

export default function ManageAdmins() {
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/admins', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setAdmins(data.admins || []);
      } else {
        setError(data.message || 'Failed to fetch admins');
      }
    } catch (err) {
      setError('An error occurred while fetching admins');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adminId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setAdmins(admins.filter(admin => admin.id !== adminId));
        setDeleteConfirm(null);
      } else {
        setError(data.message || 'Failed to delete admin');
      }
    } catch (err) {
      setError('An error occurred while deleting admin');
    }
  };

  return (
    <DashboardLayout role="admin" title="Manage Admins">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Manage Admins</h1>
            <p className={styles.subtitle}>View and manage admin accounts</p>
          </div>
          <button
            className={styles.addBtn}
            onClick={() => router.push('/admin/add-admin')}
          >
            + Add Admin
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>Loading admins...</div>
        ) : (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={styles.noData}>No admins found</td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.id}</td>
                      <td>{admin.full_name || 'N/A'}</td>
                      <td>{admin.email}</td>
                      <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                      <td>
                        {deleteConfirm === admin.id ? (
                          <div className={styles.confirmDelete}>
                            <span>Confirm?</span>
                            <button
                              className={styles.confirmBtn}
                              onClick={() => handleDelete(admin.id)}
                            >
                              Yes
                            </button>
                            <button
                              className={styles.cancelDeleteBtn}
                              onClick={() => setDeleteConfirm(null)}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            className={styles.deleteBtn}
                            onClick={() => setDeleteConfirm(admin.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
