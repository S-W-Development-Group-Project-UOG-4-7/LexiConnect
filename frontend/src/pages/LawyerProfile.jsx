import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';

const LawyerProfile = () => {
  const { lawyerId } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLawyerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch lawyer details and reviews in parallel
        const [lawyerResponse, reviewsResponse] = await Promise.all([
          api.get(`/api/v1/lawyers/${lawyerId}`),
          api.get(`/api/v1/reviews/lawyer/${lawyerId}`)
        ]);

        setLawyer(lawyerResponse.data);
        setReviews(reviewsResponse.data);
      } catch (err) {
        setError('Failed to load lawyer profile. Please try again.');
        console.error('Error fetching lawyer data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (lawyerId) {
      fetchLawyerData();
    }
  }, [lawyerId]);

  const handleBookAppointment = () => {
    navigate(`/booking/create/${lawyerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header userName="Jane Smith" userRole="Client" />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading lawyer profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header userName="Jane Smith" userRole="Client" />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header userName="Jane Smith" userRole="Client" />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Lawyer not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName="Jane Smith" userRole="Client" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Image */}
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
              👤
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {lawyer.full_name || lawyer.name}
              </h1>
              <p className="text-xl text-blue-600 mb-2">
                {lawyer.specialization || (lawyer.specializations && lawyer.specializations[0])}
              </p>

              {/* Rating */}
              <div className="flex items-center justify-center md:justify-start mb-4">
                <span className="text-2xl mr-2">⭐</span>
                <span className="text-lg font-semibold">
                  {lawyer.average_rating || lawyer.rating || 'N/A'}
                </span>
                <span className="text-gray-600 ml-2">
                  ({reviews.length} reviews)
                </span>
              </div>

              {/* Languages */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-1">Languages</h3>
                <p className="text-gray-600">
                  {lawyer.languages ? lawyer.languages.join(', ') : 'Not specified'}
                </p>
              </div>

              {/* Book Appointment Button */}
              <button
                onClick={handleBookAppointment}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Branches */}
        {lawyer.branches && lawyer.branches.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Branches</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {lawyer.branches.map((branch, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {branch.city || 'City not specified'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {branch.address || 'Address not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>

          {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">⭐</span>
                    <span className="font-semibold text-gray-900">
                      {review.rating || 'N/A'}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-gray-700">
                    {review.comment || review.review || 'No comment provided'}
                  </p>
                  {review.client_name && (
                    <p className="text-sm text-gray-500 mt-1">
                      - {review.client_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LawyerProfile;
