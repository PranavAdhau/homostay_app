import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import api from '../../lib/adminAxios';
import { formatINR } from '../../lib/currency';
import { toast } from 'sonner@2.0.3';

interface Booking {
  id: number;
  homestay_name: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_price: number;
  status: string;
  created_at: string;
}

type BookingAction = 'approve' | 'reject';

export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [verifyingAction, setVerifyingAction] = useState<{ id: number; action: BookingAction } | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<{ id: number; action: BookingAction } | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      const params = statusFilter && statusFilter !== 'all'
        ? { status: statusFilter }
        : {};
      const response = await api.get('/bookings', { params });
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreflight = async (id: number, action: BookingAction) => {
    setVerifyingAction({ id, action });
    try {
      const response = await api.post(`/bookings/${id}/preflight`, { action_name: action });
      toast.success(response.data.message || 'Inventory verification completed successfully.');
      setConfirmingAction({ id, action });
    } catch (error: any) {
      console.error(`Error verifying booking ${action}:`, error);
      toast.error(error.response?.data?.message || 'Unable to verify this booking right now');
    } finally {
      setVerifyingAction(null);
    }
  };

  const handleActionConfirm = async () => {
    if (!confirmingAction) return;

    setSubmittingAction(true);
    try {
      const response = await api.patch(`/bookings/${confirmingAction.id}/${confirmingAction.action}`, {});
      toast.success(
        response.data.message ||
          (confirmingAction.action === 'approve' ? 'Booking approved successfully' : 'Booking rejected successfully'),
      );
      setConfirmingAction(null);
      await fetchBookings();
    } catch (error: any) {
      console.error(`Error ${confirmingAction.action}ing booking:`, error);
      toast.error(
        error.response?.data?.message ||
          `Unable to ${confirmingAction.action} this booking right now`,
      );
    } finally {
      setSubmittingAction(false);
    }
  };

  const statusStyles: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    approved: 'bg-primary/10 text-primary',
    rejected: 'bg-destructive/10 text-destructive',
    completed: 'bg-muted text-muted-foreground',
  };
  const getStatusBadge = (status: string) => {
    const style = statusStyles[status] || statusStyles.pending;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
        {status}
      </span>
    );
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1">Bookings</h2>
          <p className="text-sm text-muted-foreground">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              No bookings found
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200 border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-card-foreground">{booking.homestay_name}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2.5 text-sm">
                        <div><span className="font-medium text-muted-foreground">Guest:</span> <span className="text-card-foreground">{booking.guest_name}</span></div>
                        <div><span className="font-medium text-muted-foreground">Email:</span> <span className="text-card-foreground">{booking.guest_email}</span></div>
                        <div><span className="font-medium text-muted-foreground">Check-in:</span> <span className="text-card-foreground">{booking.check_in_date}</span></div>
                        <div><span className="font-medium text-muted-foreground">Check-out:</span> <span className="text-card-foreground">{booking.check_out_date}</span></div>
                        <div><span className="font-medium text-muted-foreground">Guests:</span> <span className="text-card-foreground">{booking.number_of_guests}</span></div>
                        <div><span className="font-medium text-muted-foreground">Total:</span> <span className="font-semibold text-card-foreground">{formatINR(booking.total_price)}</span></div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2.5 shrink-0">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-success hover:bg-success/90 text-success-foreground"
                            onClick={() => void handlePreflight(booking.id, 'approve')}
                            disabled={!!verifyingAction || submittingAction}
                          >
                            <CheckCircle className="h-4 w-4 mr-1.5" />
                            {verifyingAction?.id === booking.id && verifyingAction.action === 'approve' ? 'Verifying...' : 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => void handlePreflight(booking.id, 'reject')}
                            disabled={!!verifyingAction || submittingAction}
                          >
                            <XCircle className="h-4 w-4 mr-1.5" />
                            {verifyingAction?.id === booking.id && verifyingAction.action === 'reject' ? 'Verifying...' : 'Reject'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
      <AlertDialog open={!!confirmingAction} onOpenChange={(open) => !open && !submittingAction && setConfirmingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmingAction?.action === 'approve' ? 'Approve Booking?' : 'Reject Booking?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmingAction?.action === 'approve'
                ? 'Inventory verification completed successfully. Are you sure you want to approve this booking?'
                : 'Inventory verification completed successfully. Are you sure you want to reject this booking?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submittingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleActionConfirm()} disabled={submittingAction}>
              {submittingAction
                ? 'Saving...'
                : confirmingAction?.action === 'approve'
                  ? 'Approve'
                  : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
