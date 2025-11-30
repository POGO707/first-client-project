import React, { useState } from 'react';
import { X, Star, MapPin, User, Send, Plus, MessageSquareQuote } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonials: Testimonial[];
  onAddReview: (review: Omit<Testimonial, 'id'>) => void;
}

const TestimonialsModal: React.FC<TestimonialsModalProps> = ({ isOpen, onClose, testimonials, onAddReview }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    location: '',
    text: '',
    rating: 5
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReview(newReview);
    setNewReview({ name: '', location: '', text: '', rating: 5 });
    // Keep the form open or switch back to list? Let's switch back to list on mobile to show the new review.
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-primary-900 to-primary-800 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
              <MessageSquareQuote className="text-accent-400" /> Patient Reviews
            </h2>
            <p className="text-primary-200 text-sm mt-1">Real stories from our community</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50">
          
          {/* List Section */}
          <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${isAdding ? 'hidden md:block' : 'block'}`}>
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">4.9</span>
                  <div className="flex flex-col">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">based on {testimonials.length} reviews</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsAdding(true)}
                  className="md:hidden bg-accent-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg"
                >
                  <Plus size={16} /> Write Review
                </button>
             </div>

             <div className="grid grid-cols-1 gap-4">
               {testimonials.map((t) => (
                 <div key={t.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 leading-tight">{t.name}</h4>
                          <div className="flex items-center text-xs text-gray-500 mt-0.5">
                            <MapPin size={10} className="mr-1" /> {t.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex text-yellow-400 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < t.rating ? "currentColor" : "none"} className={i < t.rating ? "" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">"{t.text}"</p>
                 </div>
               ))}
             </div>
          </div>

          {/* Form Section - Side Panel on Desktop, Full View on Mobile when active */}
          <div className={`md:w-[400px] bg-white border-l border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.05)] z-10 flex flex-col ${isAdding ? 'block h-full' : 'hidden md:flex'}`}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-lg">Share Your Experience</h3>
              {isAdding && (
                <button onClick={() => setIsAdding(false)} className="md:hidden text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              )}
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Your Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent-500 transition-colors" size={18} />
                    <input 
                      required 
                      type="text" 
                      value={newReview.name}
                      onChange={e => setNewReview({...newReview, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent-500 transition-colors" size={18} />
                    <input 
                      required 
                      type="text" 
                      value={newReview.location}
                      onChange={e => setNewReview({...newReview, location: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Barrackpore"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Rating</label>
                  <div className="flex gap-2 justify-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="focus:outline-none transition-all duration-200 hover:scale-110 active:scale-95"
                      >
                        <Star 
                          size={32} 
                          className={`${star <= newReview.rating ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" : "text-gray-300"}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Review</label>
                  <textarea 
                    required 
                    rows={4}
                    value={newReview.text}
                    onChange={e => setNewReview({...newReview, text: e.target.value})}
                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell us about your visit..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-accent-600 hover:bg-accent-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:translate-y-[-2px] flex items-center justify-center gap-2 group"
                >
                  <Send size={18} className="group-hover:translate-x-1 transition-transform" /> Submit Review
                </button>
                <p className="text-[10px] text-gray-400 text-center leading-tight px-4">
                  By submitting, you agree that your review can be displayed publicly on our website.
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TestimonialsModal;