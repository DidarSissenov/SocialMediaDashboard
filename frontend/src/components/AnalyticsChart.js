import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const AnalyticsChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Temporarily using fake data for the deom
       /* const fakeData = [
            {"date": "2024-01-01", "followers": 100, "posts": 5},
            {"date": "2024-01-02", "followers": 105, "posts": 7},
            {"date": "2024-01-03", "followers": 110, "posts": 4},
            {"date": "2024-01-04", "followers": 115, "posts": 6},
            {"date": "2024-01-05", "followers": 120, "posts": 8}
        ];

        // Parse string date to Date object for proper chart rendering
        const parsedData = fakeData.map(item => ({
            ...item,
            date: new Date(item.date)
        
        }));

        setData(parsedData);*/
        
        const fetchAnalyticsData = async () => {
            try {
                const response = await axios.get('/api/auth/analytics');
                console.log('API Response:', response.data); // Debugging: Log API response
                setData(response.data);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
                setError('Failed to fetch analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);

     // Format date for display on X-axis
    const formatDate = (date) => {
        return date.toLocaleDateString();
    };

    /*if (loading) {
        return <p>Loading analytics data...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }
*/
    // Render message if no data is available
    if (!Array.isArray(data) || data.length === 0) {
        return <p>No data available for chart yet. The chart will appear when it will have more data</p>;
    }

    // Render the bar chart with the data
    return (
        <BarChart
            width={500}
            height={300}
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis />
            <Tooltip labelFormatter={formatDate} />
            <Legend />
            <Bar dataKey="followers" fill="#8884d8" />
            <Bar dataKey="posts" fill="#82ca9d" />
        </BarChart>
    );
};

export default AnalyticsChart;