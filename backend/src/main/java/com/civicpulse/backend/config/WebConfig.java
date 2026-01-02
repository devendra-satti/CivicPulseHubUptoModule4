//Added in Module-2 for Image handling(uploads) -- 18/12
package com.civicpulse.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // This maps "http://localhost:8080/uploads/image.jpg" 
        // to the physical folder "uploads/" in your project root
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}