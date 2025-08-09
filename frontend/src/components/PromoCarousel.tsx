import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  FiberManualRecord,
} from '@mui/icons-material';
import { brandColors } from '../styles/brand';

interface PromoSlide {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  description?: string;
}

interface PromoCarouselProps {
  slides: PromoSlide[];
  autoSlide?: boolean;
  interval?: number;
  height?: string | number;
}

const PromoCarousel: React.FC<PromoCarouselProps> = ({
  slides,
  autoSlide = true,
  interval = 5000,
  height = 400,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Create extended slides array for infinite loop
  const extendedSlides = [...slides, slides[0]];

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || isHovered || slides.length <= 1) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoSlide, interval, isHovered, slides.length]);

  // Handle infinite loop transition
  useEffect(() => {
    if (currentSlide === slides.length) {
      // When reaching the duplicate first slide, jump back to real first slide
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
      }, 500); // Match transition duration

      return () => clearTimeout(timer);
    }
  }, [currentSlide, slides.length]);

  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setIsTransitioning(true);
      setCurrentSlide(index);
    }
  };

  const goToPrevious = () => {
    setIsTransitioning(true);
    if (currentSlide === 0) {
      // Jump to last slide
      setCurrentSlide(slides.length - 1);
    } else {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev + 1);
  };

  if (!slides.length) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        height,
        borderRadius: 3,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.primary.light} 100%)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Slide Container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Slides */}
        <Box
          sx={{
            display: 'flex',
            width: `${extendedSlides.length * 100}%`,
            height: '100%',
            transform: `translateX(-${(currentSlide * 100) / extendedSlides.length}%)`,
            transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
          }}
        >
          {extendedSlides.map((slide, index) => (
            <Box
              key={`${slide.id}-${index}`}
              sx={{
                width: `${100 / extendedSlides.length}%`,
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Background Image */}
              <Box
                component="img"
                src={slide.image}
                alt={slide.title}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.7)',
                }}
              />

              {/* Content Overlay */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  textAlign: 'center',
                  color: 'white',
                  px: 4,
                  py: 6,
                  maxWidth: '800px',
                }}
              >
                <Typography
                  variant={isMobile ? 'h4' : 'h3'}
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    mb: 2,
                  }}
                >
                  {slide.title}
                </Typography>
                
                {slide.subtitle && (
                  <Typography
                    variant={isMobile ? 'h6' : 'h5'}
                    sx={{
                      opacity: 0.95,
                      mb: 2,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      fontWeight: 500,
                    }}
                  >
                    {slide.subtitle}
                  </Typography>
                )}

                {slide.description && (
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.9,
                      maxWidth: '600px',
                      mx: 'auto',
                      lineHeight: 1.6,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    }}
                  >
                    {slide.description}
                  </Typography>
                )}
              </Box>

              {/* Gradient Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(229, 30, 46, 0.3) 0%, rgba(0, 0, 0, 0.2) 100%)',
                  zIndex: 1,
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <IconButton
              onClick={goToPrevious}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                zIndex: 3,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
                backdropFilter: 'blur(10px)',
              }}
            >
              <ChevronLeft fontSize="large" />
            </IconButton>

            <IconButton
              onClick={goToNext}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                zIndex: 3,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
                backdropFilter: 'blur(10px)',
              }}
            >
              <ChevronRight fontSize="large" />
            </IconButton>
          </>
        )}

        {/* Dots Indicator */}
        {slides.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
              zIndex: 3,
            }}
          >
            {slides.map((_, index) => (
              <IconButton
                key={index}
                onClick={() => goToSlide(index)}
                sx={{
                  p: 0.5,
                  color: (currentSlide === index || (currentSlide === slides.length && index === 0)) 
                    ? 'white' 
                    : 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    color: 'white',
                  },
                }}
              >
                <FiberManualRecord sx={{ fontSize: 12 }} />
              </IconButton>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default PromoCarousel;