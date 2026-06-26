import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import profileImage from '../assets/react.svg'
import CreateForm from '../components/CreateForm'
import AllEventsList from '../components/AllEventsList'
import AttendeesList from '../components/AttendeesList'
import './Sidebar.css'

const sectionItems = {
    Events: [
        'Create Event',
        'Draft Events List',
        'Published Events List',
    ],
    Attendees: [
        'Attendee List',
       
    ],
    'User Management': [
        'Admin users',
        'Event organizers',
        'Roles & permissions',
    ],
    Settings: [
        'Profile settings',
        'Event settings (default templates, limits)',
        'System configuration',
    ],
}

export default function Sidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const [userName, setUserName] = useState('')
    const [selectedSection, setSelectedSection] = useState('Events')
    const [activeItem, setActiveItem] = useState('')

    useEffect(() => {
        const storedName = localStorage.getItem('name')
        if (storedName) setUserName(storedName)
    }, [])

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const item = params.get('item')
        if (item) {
            setActiveItem(item)
        }
    }, [location.search])

    const handleLogout = () => {
        localStorage.clear()
        sessionStorage.clear()
        navigate('/login')
    }

    return (
        <div className="dashboard-layout">
            <aside className="sidebar-panel">
                <div className="sidebar-brand">Event Management</div>

               

                <nav className="sidebar-nav">
                    {Object.keys(sectionItems).map((section) => (
                        <div key={section} className="sidebar-section">
                            <button
                                type="button"
                                className={`sidebar-link ${selectedSection === section ? 'active' : ''}`}
                                onClick={() => setSelectedSection((prev) => (prev === section ? '' : section))}
                            >
                                {section}
                            </button>

                            {selectedSection === section && (
                                <div className="sidebar-submenu">
                                    {sectionItems[section].map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            className="sidebar-sublink"
                                            onClick={() => setActiveItem(item)}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-link" type="button" onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="workspace">
                {!activeItem && (
                    <section className="topbar">
                        <div>
                            <h2>Welcome back, {userName || 'Admin'}!</h2>
                            <p>Here's the Event Management overview for today.</p>
                        </div>
                    </section>
                )}

                {activeItem === 'Create Event' ? (
                    <CreateForm />
                ) : activeItem === 'Draft Events List' ? (
                    <AllEventsList />
                ) : activeItem === 'Attendee List' ? (
                    <AttendeesList />
                ) : activeItem ? (
                    <section className="dashboard-grid">
                        <article className="content-card">
                            <h3>{activeItem}</h3>
                            <p>This view is selected from the sidebar.</p>
                        </article>
                    </section>
                ) : (
                    <section className="dashboard-grid">
                        <article className="content-card">
                            <h3>Upcoming Events</h3>
                            <p>6</p>
                        </article>
                        <article className="content-card">
                            <h3>Attendees Today</h3>
                            <p>342</p>
                        </article>
                        <article className="content-card">
                            <h3>Quick Actions</h3>
                            <span>Create event, Manage attendees, Export reports.</span>
                        </article>
                    </section>
                )}
            </main>
        </div>
    )
}
