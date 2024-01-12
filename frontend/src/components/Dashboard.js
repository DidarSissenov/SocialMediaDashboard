import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AnalyticsChart from './AnalyticsChart';


const Dashboard = () => {
  const [isInstagramLinked, setIsLinked] = useState(false);
  const [mediaData, setMediaData] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate(); 
  const [plannedPosts, setPlannedPosts] = useState([]);
  const [isTwitterLinked, setIsTwitterLinked] = useState(false);
  const [twitterProfile, setTwitterProfile] = useState(null); 
  const [tweetText, setTweetText] = useState('');
  
  // UseEffect to check links and fetch data
  useEffect(() => {
    checkInstagramLink();
    checkTwitterLink();
    fetchPlannedPosts();
    // Fetch data only if the respective accounts are linked
    if (isInstagramLinked) {
      fetchBasicData();
    }
    if (isTwitterLinked) {
      fetchTwitterProfile();
    }
    }, 
  []);


  const postTweet = async () => {
    try {
      await axios.post('/api/twitter/post-tweet', { text: tweetText });
      alert('Tweet posted successfully');
      setTweetText(''); 
    } catch (error) {
      console.error('Error posting tweet:', error);
      alert('Error posting tweet');
    }
  };


  const checkTwitterLink = async () => {
    try {
        const response = await axios.get('/api/twitter/check-link');
        setIsTwitterLinked(response.data.isLinked);
        if (response.data.isLinked) {
            fetchTwitterProfile();
        }
    } catch (error) {
        console.error('Error checking Twitter link:', error);
        setError('Error checking Twitter link.');
    }
};

  const fetchPlannedPosts = async () => {
    try {
      const response = await axios.get('/api/auth/posts'); 
      setPlannedPosts(response.data);
    } catch (error) {
      console.error('Error fetching planned posts:', error);
      
    }
  };

  const updatePostStatus = (postId, newStatus) => {
    setPlannedPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId ? { ...post, status: newStatus } : post
      )
    );
  };

  const deletePlannedPost = async (postId) => {
    try {
      await axios.delete(`/api/auth/posts/${postId}`);
      setPlannedPosts(plannedPosts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting planned post:', error);
    }
  };

  const fetchTwitterProfile = async () => {
    try {
        const response = await axios.get('/api/twitter/my-profile');
        setTwitterProfile(response.data);
    } catch (error) {
        console.error('Error fetching Twitter profile:', error);
    }
};

  const handleLinkTwitter = () => {
    window.location.href = '/api/twitter/oauth';
  };
  const checkInstagramLink = async () => {
    try {
      const response = await axios.get('/api/instagram/check-link');
      setIsLinked(response.data.isLinked);
      if (response.data.isLinked) {
        fetchBasicData();
      }
    } catch (error) {
      console.error('Error checking Instagram link:', error);
      setError('Error checking Instagram link.');
    }
  };

  
  const fetchBasicData = async () => {
    try {
      const response = await axios.get('/api/instagram/basic-data');
      setProfileData(response.data.profile);
      setMediaData(response.data.media);
    } catch (error) {
      console.error('Error fetching basic Instagram data:', error);
    }
  };

  const handleLinkInstagram = () => {
    window.location.href = '/api/instagram/oauth';
  };
  
  const navigateToScheduler = () => {
    navigate('/post-scheduler'); 
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Social Media Analytics Dashboard</h1>
        <nav>
          <button onClick={navigateToScheduler}>Go to Post Scheduler</button>
          <button onClick={handleLinkInstagram}>
            {isInstagramLinked ? 'Re-link Instagram' : 'Link Instagram'}
          </button>
          <button onClick={handleLinkTwitter}>
            {isTwitterLinked ? 'Re-link Twitter' : 'Link Twitter'}
          </button>
        </nav>
      </header>
  
      {/* Display Instagram and Twitter sections only if linked */}
      <div className="account-info">
        {isInstagramLinked && profileData && (
          <div className="instagram-info">
            <h2>Instagram Profile Information</h2>
            <p>Username: {profileData.username}</p>
            <p>Account Type: {profileData.account_type}</p>
            <p>Media Count: {profileData.media_count}</p>
          </div>
        )}
  
        {isTwitterLinked && twitterProfile && (
          <div className="twitter-info">
            <h2>Twitter Profile Information</h2>
            <p>Username: {twitterProfile.username}</p>
            <p>Name: {twitterProfile.name}</p>
            <p>Description: {twitterProfile.description}</p>
            <p>Followers: {twitterProfile.public_metrics?.followers_count}</p>
            <p>Following: {twitterProfile.public_metrics?.following_count}</p>
            <p>Tweet Count: {twitterProfile.public_metrics?.tweet_count}</p>
          </div>
        )}
      </div>
  
      {/* Recent Instagram Media section */}
      <div className="media-sections">
        {mediaData.length > 0 && (
          <div className="instagram-media">
            <h2>Recent Instagram Media:</h2>
            <div className="media-grid">
              {mediaData.map((media, index) => (
                <div key={index} className="media-item instagram-item">
                  <img src={media.media_url} alt={media.caption} />
                  <p>{media.caption}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  
      {/* Planned Posts section */}
      <div className="section">
        <h2>Planned Posts</h2>
        {plannedPosts.length > 0 ? (
          <div className="media-grid">
            {plannedPosts.map((post, index) => (
              <div key={index} className="media-item">
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                {post.image && <img src={post.image} alt={post.title} />}
                <p className={`status ${post.status || 'planned'}`}>
                  {(post.status || 'planned').toUpperCase()}
                </p><br/>
                <select 
                  value={post.status || 'planned'} 
                  onChange={(e) => updatePostStatus(post._id, e.target.value)}
                  className={`status-dropdown ${post.status || 'planned'}`}
                >
                  <option value="planned">Planned</option>
                  <option value="posted">Posted</option>
                  <option value="overdue">Overdue</option>
                </select>
                <button onClick={() => deletePlannedPost(post._id)} className="delete-btn">Delete</button>
                <p className="planned-date">Planned for: {new Date(post.scheduledTime).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No planned posts available.</p>
        )}
      </div>
  
      {/* Post a Tweet section */}
      {isTwitterLinked && (
      <div className="tweet-form">
        <h2>Post a Tweet</h2>
        <textarea 
          value={tweetText} 
          onChange={(e) => setTweetText(e.target.value)} 
          placeholder="What's happening?"
        ></textarea>
        <button onClick={postTweet}>Tweet</button>
      </div>
      )}

      {/* Analytics Section*/}
      {isTwitterLinked && ( 
        <div className="analytics-section">
        <h2>Analytics</h2>
        <AnalyticsChart />
    </div>
      )}
    </div>
  )};
  
export default Dashboard;