import { useEffect, useState } from 'react';
import type { IAlertProps } from '../types/common';

const Alert = ({ isSuccess, message }: IAlertProps) => {
    const [displayAlert, setDisplayAlert] = useState<boolean>(false);

    useEffect(() => {
        if (message) {
            setDisplayAlert(true);

            const timer = setTimeout(() => {
                setDisplayAlert(false);
            }, 3000);

            return () => clearTimeout(timer); 
        }
    }, [message]);

    const className = isSuccess
        ? "alert alert-success "
        : "alert alert-error ";
    const pathD = isSuccess
        ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z";

    return (
        displayAlert && (
            <div>
                <div role="alert" className={className + "flex justify-center items-center gap-2"}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={pathD} />
                    </svg>
                    <span>{message}</span>
                </div>
            </div>
        )
    );
};

export default Alert;
