interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const FormInput = ({ label, ...props }: InputProps) => (
    <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-900">{label}</label>
        <input
            {...props}
            className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400"
        />
    </div>
);