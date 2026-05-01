package de.pumpedfitness.dumbbell.configuration.security.filter

import de.pumpedfitness.dumbbell.application.port.`in`.JwtServicePort
import de.pumpedfitness.dumbbell.infrastructure.security.JwtUtil
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtDenylistFilter(
    @Autowired val jwtService: JwtServicePort,
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authorizationHeader = request.getHeader("Authorization")
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            val token = authorizationHeader.substring(7)

            if (jwtService.isTokenDenied(token)) {
                response.status = HttpServletResponse.SC_UNAUTHORIZED
                return
            }
        }
        filterChain.doFilter(request, response)
    }


}