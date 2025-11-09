import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner, 
  Badge,
  Modal,
  ProgressBar
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { issueAPI } from '../services/api';
import { getCurrentLocation, getAddressFromCoords, formatCoordinates } from '../utils/geolocation';
import { 
  validateFileType, 
  validateFileSize, 
  createFilePreview, 
  compressImage,
  formatFileSize,
  cleanupFilePreview
} from '../utils/fileUtils';

const ISSUE_CATEGORIES = [
  { value: 'roads-transport', label: 'Roads & Transport', icon: 'fas fa-road' },
  { value: 'water-supply', label: 'Water Supply', icon: 'fas fa-tint' },
  { value: 'electricity', label: 'Electricity', icon: 'fas fa-bolt' },
  { value: 'sanitation', label: 'Sanitation', icon: 'fas fa-trash-alt' },
  { value: 'public-safety', label: 'Public Safety', icon: 'fas fa-shield-alt' },
  { value: 'health-services', label: 'Health Services', icon: 'fas fa-hospital' },
  { value: 'education', label: 'Education', icon: 'fas fa-graduation-cap' },
  { value: 'environment', label: 'Environment', icon: 'fas fa-leaf' },
  { value: 'infrastructure', label: 'Infrastructure', icon: 'fas fa-building' },
  { value: 'other', label: 'Other', icon: 'fas fa-ellipsis-h' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'secondary' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'danger' },
  { value: 'urgent', label: 'Urgent', color: 'danger' }
];

const ReportIssue = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: {
      type: 'Point',
      coordinates: [0, 0] // [longitude, latitude]
    },
    address: {
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    tags: ''
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Location state
  const [hasLocation, setHasLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationAccuracy, setLocationAccuracy] = useState(0);

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Cleanup file previews on unmount
  useEffect(() => {
    return () => {
      filePreviews.forEach(preview => {
        if (preview.url) {
          cleanupFilePreview(preview.url);
        }
      });
    };
  }, []);

  const detectLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError('');

    try {
      const location = await getCurrentLocation();
      
      setFormData(prev => ({
        ...prev,
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        }
      }));

      setLocationAccuracy(location.accuracy);
      setHasLocation(true);

      // Try to get address from coordinates
      const address = await getAddressFromCoords(location.latitude, location.longitude);
      if (address) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: address.street || '',
            area: address.area || '',
            city: address.city || '',
            state: address.state || '',
            pincode: address.pincode || ''
          }
        }));
      }

      toast.success('Location detected successfully!');
    } catch (error) {
      setLocationError(error.message);
      toast.error(`Location Error: ${error.message}`);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear field errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSizeMB = 5;

    if (selectedFiles.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`);
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (!validateFileType(file)) {
        toast.error(`${file.name} is not a valid image file`);
        continue;
      }

      if (!validateFileSize(file, maxSizeMB)) {
        toast.error(`${file.name} is too large. Maximum size is ${maxSizeMB}MB`);
        continue;
      }

      try {
        // Compress image if needed
        const compressedFile = await compressImage(file);
        const previewUrl = createFilePreview(compressedFile);
        
        validFiles.push(compressedFile);
        newPreviews.push({
          file: compressedFile,
          url: previewUrl,
          name: file.name,
          size: compressedFile.size
        });
      } catch (error) {
        toast.error(`Error processing ${file.name}`);
      }
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setFilePreviews(prev => [...prev, ...newPreviews]);
      toast.success(`${validFiles.length} image(s) added successfully`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    const preview = filePreviews[index];
    if (preview.url) {
      cleanupFilePreview(preview.url);
    }

    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
    toast.info('Image removed');
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Issue title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Issue description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    // Location validation
    if (!hasLocation) {
      newErrors.location = 'Location is required. Please enable GPS or enter manually.';
    }

    // Address validation
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      console.log('Submitting issue with data:', formData);

      // Try FormData first for file uploads
      if (selectedFiles.length > 0) {
        // Create FormData for file upload
        const submitData = new FormData();

        // Add form fields
        submitData.append('title', formData.title.trim());
        submitData.append('description', formData.description.trim());
        submitData.append('category', formData.category);
        submitData.append('priority', formData.priority);
        
        // Location and address — send as JSON strings so the server can parse them reliably
        submitData.append('location', JSON.stringify(formData.location));
        submitData.append('address', JSON.stringify(formData.address));

        // Tags
        if (formData.tags.trim()) {
          submitData.append('tags', formData.tags.trim());
        }

        // Add images
        selectedFiles.forEach((file) => {
          submitData.append('images', file);
        });

        // Submit with files
        setUploadProgress(50);
        const response = await issueAPI.createIssue(submitData);
        setUploadProgress(100);

  // Redirect to issue detail or list page, normalize created issue id
        toast.success('Issue reported successfully!');
  const created = response?.data?.issue || response?.data?.data || response?.data || {};
  const createdId = created._id || created.id || created.issue?._id || created.data?._id || created.data?.id;
        setTimeout(() => {
          if (createdId) navigate(`/issues/${createdId}`);
          else navigate('/issues');
        }, 1000);

      } else {
        // Submit as JSON when no files
        const jsonData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          priority: formData.priority,
          // Stringify location and address to match FormData behavior and server parsing
          location: JSON.stringify(formData.location),
          address: JSON.stringify(formData.address),
          tags: formData.tags.trim()
        };

        setUploadProgress(50);
        // Use the centralized API client so baseURL, auth header and error handling are consistent
        const response = await issueAPI.createIssue(jsonData);
        setUploadProgress(100);

        toast.success('Issue reported successfully!');

        // Normalize created issue id (different backends might return different shapes)
        const created = response?.data?.issue || response?.data?.data || response?.data || {};
        const createdId = created._id || created.id || created.issue?._id || created.data?._id || created.data?.id;

        setTimeout(() => {
          if (createdId) {
            navigate(`/issues/${createdId}`);
          } else {
            // Fallback to issues list if id isn't returned
            navigate('/issues');
          }
        }, 1000);
      }

    } catch (error) {
      console.error('Submit error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to submit issue';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const getCurrentLocationDisplay = () => {
    if (!hasLocation) return 'No location detected';
    
    const [lng, lat] = formData.location.coordinates;
    const formatted = formatCoordinates(lat, lng);
    return formatted.decimal;
  };

  return (
    <Container className="mt-5 pt-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-lg fade-in">
            <Card.Header className="text-center py-4">
              <h3 className="mb-0">
                <i className="fas fa-plus-circle me-2"></i>
                Report Community Issue
              </h3>
              <p className="mb-0 mt-2 opacity-75">
                Help improve your community by reporting local issues
              </p>
            </Card.Header>

            <Card.Body className="p-4">
              {!hasLocation && (
                <Alert variant="warning" className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fas fa-map-marker-alt me-2"></i>
                      <strong>Location Required:</strong> Please enable location access for accurate issue reporting.
                    </div>
                    <Button 
                      variant="outline-warning" 
                      size="sm"
                      onClick={detectLocation}
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-crosshairs me-1"></i>
                          Detect Location
                        </>
                      )}
                    </Button>
                  </div>
                </Alert>
              )}

              {locationError && (
                <Alert variant="danger" className="mb-4">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {locationError}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Issue Details Section */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Issue Details
                  </h5>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Issue Title <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Brief description of the issue (e.g., 'Pothole on Main Street')"
                      isInvalid={!!errors.title}
                      disabled={isSubmitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.title}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Detailed Description <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide detailed information about the issue, including when you noticed it and how it affects the community..."
                      isInvalid={!!errors.description}
                      disabled={isSubmitting}
                    />
                    <Form.Text className="text-muted">
                      {formData.description.length}/1000 characters
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">
                      {errors.description}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Category <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          isInvalid={!!errors.category}
                          disabled={isSubmitting}
                        >
                          <option value="">Select a category...</option>
                          {ISSUE_CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.category}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Priority Level</Form.Label>
                        <Form.Select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        >
                          {PRIORITY_LEVELS.map(priority => (
                            <option key={priority.value} value={priority.value}>
                              {priority.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Tags (Optional)</Form.Label>
                    <Form.Control
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Add tags separated by commas (e.g., urgent, school-zone, traffic)"
                      disabled={isSubmitting}
                    />
                    <Form.Text className="text-muted">
                      Separate multiple tags with commas
                    </Form.Text>
                  </Form.Group>
                </div>

                {/* Location Section */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Location Information
                  </h5>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label className="mb-0">GPS Location</Form.Label>
                      {hasLocation && (
                        <Badge bg="success">
                          <i className="fas fa-check-circle me-1"></i>
                          Location Detected
                        </Badge>
                      )}
                    </div>
                    
                    <div className="border rounded p-3 bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Coordinates:</strong> {getCurrentLocationDisplay()}
                          {locationAccuracy > 0 && (
                            <div className="text-muted small">
                              Accuracy: ±{Math.round(locationAccuracy)}m
                            </div>
                          )}
                        </div>
                        <div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={detectLocation}
                            disabled={isLoadingLocation}
                            className="me-2"
                          >
                            {isLoadingLocation ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <i className="fas fa-crosshairs"></i>
                            )}
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => setShowLocationModal(true)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                    {errors.location && (
                      <div className="text-danger small mt-1">{errors.location}</div>
                    )}
                  </div>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Street Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          placeholder="Street address"
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Area/Locality</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.area"
                          value={formData.address.area}
                          onChange={handleInputChange}
                          placeholder="Area or locality"
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          City <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          isInvalid={!!errors['address.city']}
                          disabled={isSubmitting}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors['address.city']}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          placeholder="State"
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Pincode</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.pincode"
                          value={formData.address.pincode}
                          onChange={handleInputChange}
                          placeholder="Pincode"
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Nearby Landmark</Form.Label>
                    <Form.Control
                      type="text"
                      name="address.landmark"
                      value={formData.address.landmark}
                      onChange={handleInputChange}
                      placeholder="Nearby landmark (e.g., 'Near City Hospital', 'Opposite ABC School')"
                      disabled={isSubmitting}
                    />
                  </Form.Group>
                </div>

                {/* Image Upload Section */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-camera me-2"></i>
                    Photo Evidence ({selectedFiles.length}/5)
                  </h5>

                  <div className="border-2 border-dashed border-primary rounded p-4 text-center mb-3">
                    <i className="fas fa-cloud-upload-alt fa-2x text-primary mb-2"></i>
                    <p className="mb-2">
                      <strong>Upload photos of the issue</strong>
                    </p>
                    <p className="text-muted small mb-3">
                      Drag and drop images here, or click to select files<br />
                      Supported formats: JPG, PNG, GIF, WebP (Max 5MB each)
                    </p>
                    <Button 
                      variant="outline-primary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting || selectedFiles.length >= 5}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Choose Files
                    </Button>
                    <Form.Control
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </div>

                  {filePreviews.length > 0 && (
                    <div className="row g-3">
                      {filePreviews.map((preview, index) => (
                        <div key={index} className="col-md-3 col-sm-4 col-6">
                          <div className="image-preview position-relative">
                            <img
                              src={preview.url}
                              alt={`Preview ${index + 1}`}
                              className="img-fluid rounded"
                              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              className="position-absolute top-0 end-0 m-1"
                              onClick={() => removeFile(index)}
                              style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                            <div className="mt-1">
                              <small className="text-muted">
                                {formatFileSize(preview.size)}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Section */}
                <div className="text-center">
                  {isSubmitting && (
                    <div className="mb-3">
                      <ProgressBar 
                        now={uploadProgress} 
                        label={`${uploadProgress}%`}
                        className="mb-2"
                      />
                      <small className="text-muted">Submitting your report...</small>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !hasLocation}
                    className="px-5"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Submitting Report...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Submit Issue Report
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Location Manual Entry Modal */}
      <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-map-marker-alt me-2"></i>
            Manual Location Entry
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <i className="fas fa-info-circle me-2"></i>
            Enter GPS coordinates manually if automatic detection fails. 
            You can get coordinates from Google Maps by right-clicking on the location.
          </Alert>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Latitude</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  placeholder="e.g., 28.6139"
                  value={formData.location.coordinates[1] || ''}
                  onChange={(e) => {
                    const lat = parseFloat(e.target.value);
                    if (!isNaN(lat)) {
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          coordinates: [prev.location.coordinates[0], lat]
                        }
                      }));
                    }
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Longitude</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  placeholder="e.g., 77.2090"
                  value={formData.location.coordinates[0] || ''}
                  onChange={(e) => {
                    const lng = parseFloat(e.target.value);
                    if (!isNaN(lng)) {
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          coordinates: [lng, prev.location.coordinates[1]]
                        }
                      }));
                    }
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowLocationModal(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              const [lng, lat] = formData.location.coordinates;
              if (lat && lng) {
                setHasLocation(true);
                setLocationError('');
                setShowLocationModal(false);
                toast.success('Location updated manually');
              } else {
                toast.error('Please enter valid coordinates');
              }
            }}
          >
            <i className="fas fa-save me-2"></i>
            Save Location
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReportIssue;