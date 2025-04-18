import { useState, useEffect } from 'react';

function PlayerStats({ championName }) {
    const [stats, setStats] = useState({ popularity: null, winrate: null, banrate: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch(`/api/get-champion-stats?champion=${championName}`);
                const data = await res.json();
                setStats(data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching champion stats');
                setLoading(false);
            }
        }

        fetchStats();
    }, [championName]);

    if (loading) {
        return <div>Loading stats...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h3>{championName} Stats</h3>
            <p>Popularity: {stats.popularity}%</p>
            <p>Winrate: {stats.winrate}%</p>
            <p>Banrate: {stats.banrate}%</p>
        </div>
    );
}

export default PlayerStats;
