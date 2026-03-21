"use client";

interface Props {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DateInput({ id, name, value, defaultValue, required, className, onChange }: Props) {
  return (
    <input
      id={id}
      name={name}
      type="date"
      value={value}
      defaultValue={defaultValue}
      required={required}
      className={className}
      onChange={onChange}
      onClick={(e) => e.currentTarget.showPicker?.()}
    />
  );
}
