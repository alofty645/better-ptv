import { useState } from "react";
import { Input } from "@/components/ui/input";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  disabled?: boolean;
}

const TimePicker = ({
  value,
  onChange,
  label,
  disabled = false,
}: TimePickerProps) => {
  const [time, setTime] = useState(value || "08:00");

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium">{label}</label>}{" "}
      <div className="flex items-center">
        <Input
          type="time"
          value={time}
          onChange={handleTimeChange}
          className="w-full"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export { TimePicker };
