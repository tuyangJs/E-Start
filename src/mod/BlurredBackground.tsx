
const BlurredBackground = ({ 
  src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb", 
  blur = 5
}) => {
  return (
    <div className="blur-container">
      {/* 高斯模糊背景层 */}
      <div 
        className="blur-layer" 
        style={{
          backgroundImage: `url(${src})`,
          filter: `blur(${blur}px)`
        }}
      />
     
    </div>
  );
};

export default BlurredBackground;