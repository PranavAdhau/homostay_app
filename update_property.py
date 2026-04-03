import sys
import re

file_path = r'\\wsl.localhost\Ubuntu\home\pranav\homostay_app\client\src\components\PropertyDetailPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Homestay interface
text = text.replace('  price_per_night: number;\n  booking_type: string;\n  amenities:', '  price_per_night: number;\n  amenities:')

# 2. Time picker dropdown
text = re.sub(r'// ─── Custom 12h Time Picker.*?export default', 'export default', text, flags=re.DOTALL)

# 3. State vars
text = text.replace("  const [checkInTime, setCheckInTime] = useState('');\n  const [checkOutTime, setCheckOutTime] = useState('');\n", "")

# 4. Total calc
old_total = """  const total = (() => {
    if (!homestay) return 0;
    if (homestay.booking_type === 'hour_based' && checkInTime && checkOutTime) {
      const h = Math.ceil((new Date(`${checkOut} ${checkOutTime}`).getTime() - new Date(`${checkIn} ${checkInTime}`).getTime()) / 36e5);
      return (h / 24) * homestay.price_per_night;
    }
    return nights * homestay.price_per_night;
  })();"""
new_total = """  const total = (() => {
    if (!homestay) return 0;
    return nights * homestay.price_per_night;
  })();"""
text = text.replace(old_total, new_total)

# 5. api.post
old_api = """      const r = await api.post('/bookings', {
        booking: {
          homestay_id: homestay.id, guest_name: guestName, guest_email: guestEmail,
          guest_phone: guestPhone, check_in_date: checkIn, check_out_date: checkOut,
          check_in_time: checkInTime || null, check_out_time: checkOutTime || null,
          number_of_guests: parseInt(guests), total_price: total,
        },
      });"""
new_api = """      const r = await api.post('/bookings', {
        booking: {
          homestay_id: homestay.id, guest_name: guestName, guest_email: guestEmail,
          guest_phone: guestPhone, check_in_date: checkIn, check_out_date: checkOut,
          number_of_guests: parseInt(guests), total_price: total,
        },
      });"""
text = text.replace(old_api, new_api)

# 6. Form props usages (mobile & desktop)
old_form_invocation = """                checkIn={checkIn} setCheckIn={setCheckIn}
                checkOut={checkOut} setCheckOut={setCheckOut}
                checkInTime={checkInTime} setCheckInTime={setCheckInTime}
                checkOutTime={checkOutTime} setCheckOutTime={setCheckOutTime}
                nights={nights} total={total}"""
new_form_invocation = """                checkIn={checkIn} setCheckIn={setCheckIn}
                checkOut={checkOut} setCheckOut={setCheckOut}
                nights={nights} total={total}"""
text = text.replace(old_form_invocation, new_form_invocation)

# 7. Form signature props
old_props = """interface ReservationFormProps {
  homestay: {
    capacity: number;
    booking_type: string;
    price_per_night: number;
  };
  guests: string; setGuests: (v: string) => void;
  guestName: string; setGuestName: (v: string) => void;
  guestEmail: string; setGuestEmail: (v: string) => void;
  guestPhone: string; setGuestPhone: (v: string) => void;
  checkIn: string; setCheckIn: (v: string) => void;
  checkOut: string; setCheckOut: (v: string) => void;
  checkInTime: string; setCheckInTime: (v: string) => void;
  checkOutTime: string; setCheckOutTime: (v: string) => void;
  nights: number;
  total: number;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  checkoutMin: string;
  fieldLabel: React.CSSProperties;
  fieldInput: React.CSSProperties;
}

function ReservationForm({
  homestay, guests, setGuests, guestName, setGuestName,
  guestEmail, setGuestEmail, guestPhone, setGuestPhone,
  checkIn, setCheckIn, checkOut, setCheckOut,
  checkInTime, setCheckInTime, checkOutTime, setCheckOutTime,
  nights, total, submitting, handleSubmit, checkoutMin, fieldLabel,
}: ReservationFormProps) {"""
new_props = """interface ReservationFormProps {
  homestay: {
    capacity: number;
    price_per_night: number;
  };
  guests: string; setGuests: (v: string) => void;
  guestName: string; setGuestName: (v: string) => void;
  guestEmail: string; setGuestEmail: (v: string) => void;
  guestPhone: string; setGuestPhone: (v: string) => void;
  checkIn: string; setCheckIn: (v: string) => void;
  checkOut: string; setCheckOut: (v: string) => void;
  nights: number;
  total: number;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  checkoutMin: string;
  fieldLabel: React.CSSProperties;
  fieldInput: React.CSSProperties;
}

function ReservationForm({
  homestay, guests, setGuests, guestName, setGuestName,
  guestEmail, setGuestEmail, guestPhone, setGuestPhone,
  checkIn, setCheckIn, checkOut, setCheckOut,
  nights, total, submitting, handleSubmit, checkoutMin, fieldLabel,
}: ReservationFormProps) {"""
text = text.replace(old_props, new_props)

# 8. TSX time elements
tsx_time = """        {/* Time row — side by side, same layout as date row */}
        {(homestay.booking_type === 'hour_based' || homestay.booking_type === 'both') && (
          <div className="pdp-date-row">
            <div style={{ minWidth: 0 }}>
              <label style={fieldLabel}>Check-in Time</label>
              <TimePickerDropdown
                value={checkInTime}
                onChange={setCheckInTime}
                example="e.g. 2:00 PM"
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={fieldLabel}>Check-out Time</label>
              <TimePickerDropdown
                value={checkOutTime}
                onChange={setCheckOutTime}
                example="e.g. 11:00 AM"
              />
            </div>
          </div>
        )}"""
text = text.replace(tsx_time, "")
text = text.replace("\n\n\n", "\n\n")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Done")
