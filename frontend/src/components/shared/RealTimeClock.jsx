import React, { useState, useEffect } from 'react';

const RealTimeClock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Set up an interval to update the time every second
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Clean up the interval when the component is unmounted
        // This is crucial to prevent memory leaks
        return () => {
            clearInterval(timerId);
        };
    }, []); // The empty dependency array ensures this effect runs only once on mount

    // Format the date as "21 AUG 2025"
    const formattedDate = currentTime.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).toUpperCase();

    // Format the time as "01:09:25 AM"
    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    return (
        <div className="hidden md:flex items-center gap-4 text-sm text-gray-medium">
            <div className="text-right">
                <p className="font-semibold text-gray-dark">{formattedDate}</p>
                <p>{formattedTime}</p>
            </div>
        </div>
    );
};

export default RealTimeClock;