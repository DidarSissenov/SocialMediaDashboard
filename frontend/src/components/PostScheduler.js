import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/PostScheduler.css';
import 'react-datepicker/dist/react-datepicker.css';

const localizer = momentLocalizer(moment);
Modal.setAppElement('#root');

const PostScheduler = () => {
  // State hooks
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [events, setEvents] = useState([]);
  const [postDetails, setPostDetails] = useState({ id: '', title: '', description: '', image: null });
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  // Time options for Select component
  const timeOptions = Array.from({ length: 24 }, (_, index) => {
    const hour = index < 10 ? `0${index}` : index;
    return { value: `${hour}:00`, label: `${hour}:00` };
  });

  // Event handlers
  const handleDateChange = date => setSelectedDate(date);
  const handleTimeChange = selectedOption => setSelectedTime(selectedOption.value);
  const handleInputChange = e => setPostDetails({ ...postDetails, [e.target.name]: e.target.value });
  const handleImageChange = e => setPostDetails({ ...postDetails, image: e.target.files[0] });

  // Submit post (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dateTime = moment(selectedDate).set({
      hour: moment(selectedTime, 'HH:mm').hour(),
      minute: moment(selectedTime, 'HH:mm').minute(),
    }).toDate();

    const formData = new FormData();
    formData.append('title', postDetails.title);
    formData.append('description', postDetails.description);
    formData.append('scheduledTime', dateTime);
    if (postDetails.image) {
      formData.append('image', postDetails.image);
    }

    try {
      let response;
      if (isEditMode) {
        response = await axios.put(`/api/auth/posts/${postDetails.id}`, formData);
        // Update existing event in the calendar
        setEvents(events.map(event => event.id === postDetails.id ? { ...event, ...response.data } : event));
      } else {
        response = await axios.post('/api/auth/posts', formData);
        // Add new event to the calendar
        setEvents([...events, { ...response.data, id: response.data._id }]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  // Open modal to add or edit post
  const openModal = (event = null) => {
    setModalIsOpen(true);
    if (event) {
      // Edit mode
      setIsEditMode(true);
      setPostDetails({ 
        id: event.id, 
        title: event.title, 
        description: event.description, 
        image: event.image 
      });
      setSelectedDate(new Date(event.start));
      setSelectedTime(moment(event.start).format('HH:mm'));
    } else {
      // Add mode
      setIsEditMode(false);
      setPostDetails({ id: '', title: '', description: '', image: null });
    }
  };

  const closeModal = () => setModalIsOpen(false);

  // Fetch scheduled posts on mount
  useEffect(() => {
    const fetchScheduledPosts = async () => {
      try {
        const response = await axios.get('/api/auth/posts');
        const fetchedEvents = response.data.map(post => ({
          ...post,
          id: post._id,
          start: new Date(post.scheduledTime),
          end: new Date(post.scheduledTime),
        }));
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching scheduled posts:', error);
      }
    };
    fetchScheduledPosts();
  }, []);

  // Navigate back to the dashboard
  const redirectToDashboard = () => navigate('/dashboard');

  return (
    <div className="post-scheduler">
      {/* Calendar component */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, margin: '50px' }}
        onSelectEvent={(event) => openModal(event)}
      />
      {/* Back to Dashboard button */}
      <button className="add-post-btn" onClick={redirectToDashboard}>Back to Dashboard</button>
      {/* Add Post button */}
      <button className="add-post-btn" onClick={() => openModal()}>Add Post</button>
      
      {/* Modal for creating or editing a post */}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal">
        <form onSubmit={handleSubmit} className="modal-form">
          <h2>{isEditMode ? 'Edit Post' : 'Schedule a Post'}</h2>
          <input type="text" name="title" value={postDetails.title} onChange={handleInputChange} placeholder="Title" />
          <textarea name="description" value={postDetails.description} onChange={handleInputChange} placeholder="Description" />
          <DatePicker selected={selectedDate} onChange={handleDateChange} />
          <Select
            options={timeOptions}
            value={timeOptions.find(option => option.value === selectedTime)}
            onChange={handleTimeChange}
          />
          <input type="file" name="image" onChange={handleImageChange} />
          <button type="submit" className="submit-btn">{isEditMode ? 'Update' : 'Schedule'}</button>
          <button onClick={closeModal} className="cancel-btn">Cancel</button>
        </form>
      </Modal>
    </div>
  );
};

export default PostScheduler;
