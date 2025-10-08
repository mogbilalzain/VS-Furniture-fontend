const QuoteSection = () => {
  return (
    <section className="quote-section quote-section-enhanced text-white py-16 md:py-24 text-center px-4 min-h-[60vh] flex items-center justify-center">
      {/* Animated background elements */}
      <div className="bg-element"></div>
      <div className="bg-element"></div>
      <div className="bg-element"></div>
      
      <div className="container mx-auto max-w-4xl quote-content">
        <p className="text-3xl md:text-4xl italic font-normal leading-relaxed quote-enhanced-text">
          <em>Design spaces where students thrive</em>
          <span className="quote-hyphen"></span>
          <br />
          <span className="block mt-4 font-bold">Education delivered by heart</span>
        </p>
      </div>
    </section>
  );
};

export default QuoteSection;