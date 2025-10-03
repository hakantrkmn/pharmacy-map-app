interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  loading?: boolean;
}

export default function DatePicker({ selectedDate, onDateChange, loading = false }: DatePickerProps) {
  
  // Generate date options (today and next 6 days)
  const generateDateOptions = () => {
    const options = [];
    const todayDate = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('tr-TR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
      
      options.push({
        value: dateString,
        label: displayDate
      });
    }
    
    return options;
  };

  const dateOptions = generateDateOptions();

  return (
    <div className="date-picker-compact">
      <div className="date-picker-row">
        <label htmlFor="date-select" className="date-label">
          📅 Tarih:
        </label>
        <select
          id="date-select"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          disabled={loading}
          className="date-select-compact"
        >
          {dateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {loading && (
          <div className="loading-spinner-small">
            <span className="spinner-small"></span>
          </div>
        )}
      </div>
    </div>
  );
}
