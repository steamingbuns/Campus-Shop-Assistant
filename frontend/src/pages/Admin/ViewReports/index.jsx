import { useState } from 'react';
import './ViewReports.css'

function ViewReports() {
    const [searchQuery, setSearchQuery] = useState('');

    return(
    <div className='view-reports-page'>
        <h1>Hi</h1>
        <div className='container'>
            <div className='search-reports'>
                <input type='text'
                className='search-input'
                placeholder='Enter a name or ID'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className='reports-list'>

            </div>
        </div>
    </div>);
}

export default ViewReports