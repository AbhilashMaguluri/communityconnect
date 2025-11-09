import React, { useState, useEffect } from 'react';
import { createIssue, getCurrentUser } from '../api/api';
import { useNavigate } from 'react-router-dom';

const ReportIssue = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Infrastructure',
    priority: 'Medium',
    location: { lat: 0, lng: 0 },
    address: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get current user
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    // Get user's current location if requested
    if (useCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Could not get your location. Please enter it manually.');
        }
      );
    }
  }, [useCurrentLocation]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onFileChange = (e) => {
    setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await createIssue(formData, selectedFiles);
      
      if (response.data.success) {
        setSuccess('Issue reported successfully!');
        setTimeout(() => {
          navigate(`/issues/${response.data.issue._id}`);
        }, 2000);
      } else {
        setError(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      setError(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card mt-4">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Report an Issue</h4>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={onChange}
                    required
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={onChange}
                    >
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Public Safety">Public Safety</option>
                      <option value="Environment">Environment</option>
                      <option value="Community">Community</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="priority" className="form-label">Priority</label>
                    <select
                      className="form-select"
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={onChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="useCurrentLocation"
                      checked={useCurrentLocation}
                      onChange={() => setUseCurrentLocation(!useCurrentLocation)}
                    />
                    <label className="form-check-label" htmlFor="useCurrentLocation">
                      Use my current location
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={onChange}
                    placeholder="Enter address or location details"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="images" className="form-label">Images (optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={onFileChange}
                  />
                  <div className="form-text">You can upload up to 5 images</div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mb-3">
                    <h6>Selected Images:</h6>
                    <div className="d-flex flex-wrap">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="position-relative me-2 mb-2">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            className="border rounded"
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            onClick={() => removeFile(index)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Issue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;