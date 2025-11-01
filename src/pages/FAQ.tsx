import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MessageCircle, Headset, Shield, Anchor, CreditCard, Phone, Mail } from 'lucide-react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqCategories = [
    {
      id: 'general',
      title: 'General Questions',
      icon: <MessageCircle className="w-5 h-5" />,
      items: [
        {
          question: 'What is included in the yacht charter?',
          answer: 'Our yacht charters include the yacht rental, professional crew, fuel for standard cruising, insurance, and basic amenities. Additional services like food, beverages, and water sports may be available at an extra cost.'
        },
        {
          question: 'Do I need a license to charter a yacht?',
          answer: 'For crewed charters, you do not need a license as a professional captain will be provided. For bareboat charters, a valid sailing license and experience may be required depending on the destination and yacht size.'
        },
        {
          question: 'What is the cancellation policy?',
          answer: 'Cancellation policies vary depending on the charter agreement. Typically, cancellations made more than 60 days before the charter date receive a full refund, while cancellations within 30 days may be subject to fees. Please refer to your specific charter agreement for details.'
        }
      ]
    },
    {
      id: 'booking',
      title: 'Booking & Payment',
      icon: <CreditCard className="w-5 h-5" />,
      items: [
        {
          question: 'How far in advance should I book a yacht?',
          answer: 'We recommend booking as early as possible, especially for peak seasons (typically summer months and holidays). A minimum of 2-3 months in advance is suggested for the best selection, but last-minute bookings may be available.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), bank transfers, and in some cases, cryptocurrency. A deposit is typically required to secure your booking, with the balance due before your charter date.'
        },
        {
          question: 'Are there any additional fees?',
          answer: 'Additional fees may include: Advanced Provisioning Allowance (APA) for expenses like fuel, food, and dockage (usually 20-30% of the charter fee), local taxes, crew gratuity (typically 10-20% of the charter fee), and any additional services you request.'
        }
      ]
    },
    {
      id: 'onboard',
      title: 'Onboard Experience',
      icon: <Anchor className="w-5 h-5" />,
      items: [
        {
          question: 'What should I bring on my yacht charter?',
          answer: 'We recommend bringing: soft-soled shoes, swimwear, sunscreen, sunglasses, a hat, light jacket, personal toiletries, and any necessary medications. Most yachts provide towels, linens, and basic toiletries. Please pack in soft-sided luggage for easier storage.'
        },
        {
          question: 'Can I bring my own food and drinks?',
          answer: 'Yes, you can bring your own food and drinks, or we can arrange for provisioning services. Many charters include a professional chef who can prepare meals according to your preferences. Please inform us of any dietary restrictions in advance.'
        },
        {
          question: 'Is there Wi-Fi on board?',
          answer: 'Most of our yachts are equipped with Wi-Fi, though the speed and reliability may vary depending on your location. Some remote areas may have limited or no connectivity. We can provide details about connectivity options for your specific charter.'
        }
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Policies',
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          question: 'What safety measures are in place?',
          answer: 'All our yachts meet strict safety standards and are equipped with life jackets, life rafts, first aid kits, and emergency equipment. Our crew is trained in safety procedures and first aid. We conduct regular safety drills and maintenance checks.'
        },
        {
          question: 'What is your smoking policy?',
          answer: 'Smoking is generally not permitted inside the yachts. Designated smoking areas are available on the exterior decks. Please dispose of cigarette butts properly and never throw them overboard due to fire hazards and environmental concerns.'
        },
        {
          question: 'What happens in case of bad weather?',
          answer: 'The captain will monitor weather conditions and may adjust the itinerary for safety. In case of severe weather, we will work with you to reschedule your charter or provide a refund according to our cancellation policy. Your safety is our top priority.'
        }
      ]
    }
  ];

  const popularQuestions = [
    {
      question: 'How many people can the yachts accommodate?',
      answer: 'Our yachts vary in size and can accommodate anywhere from 2 to 50+ guests. The capacity depends on the specific yacht and local regulations. Please check the details of each yacht or contact us for personalized recommendations based on your group size.'
    },
    {
      question: 'Can I customize my itinerary?',
      answer: 'Absolutely! We encourage you to customize your itinerary based on your preferences. Our team can help you plan the perfect route, suggest activities, and arrange special requests to make your yachting experience truly unique and memorable.'
    },
    {
      question: 'Are pets allowed on board?',
      answer: 'Pet policies vary by yacht. Some yachts may allow pets with prior approval, while others may not permit them due to safety and hygiene reasons. Please inform us in advance if you plan to bring a pet, and we can advise you on the options available.'
    },
    {
      question: 'What is the best time of year to charter a yacht?',
      answer: 'The best time depends on your destination. In the Mediterranean, May to October offers ideal conditions, while the Caribbean is best from November to April. Our team can provide specific recommendations based on your preferred destination and the experience you\'re seeking.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-blue-900 to-blue-700 flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl"
          >
            Find answers to common questions about our yacht charters
          </motion.p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Questions */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Popular Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {popularQuestions.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">Browse by Category</h2>
          
          <div className="space-y-6">
            {faqCategories.map((category, catIndex) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: catIndex * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl overflow-hidden shadow-md"
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
                  onClick={() => toggleAccordion(catIndex)}
                >
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-3">{category.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-800">{category.title}</h3>
                  </div>
                  {activeIndex === catIndex ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                <AnimatePresence>
                  {activeIndex === catIndex && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-4">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="border-t border-gray-100 pt-4">
                            <h4 className="font-medium text-gray-800 mb-2">{item.question}</h4>
                            <p className="text-gray-600 text-sm">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-blue-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
            <Headset className="w-12 h-12 mx-auto mb-6 text-blue-300" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Our dedicated support team is here to help you with any additional questions you may have about our yacht charters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                <a href="tel:+97112345678">
                  <Phone className="w-4 h-4 mr-2" />
                  +971 12 345 6789
                </a>
              </Button>
              <Button asChild className="bg-white text-blue-900 hover:bg-gray-100">
                <a href="mailto:support@asfaryachts.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
