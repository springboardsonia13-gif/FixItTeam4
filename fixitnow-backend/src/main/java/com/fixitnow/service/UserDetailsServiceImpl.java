// package com.fixitnow.service;

// import com.fixitnow.model.User;
// import com.fixitnow.repository.UserRepository;
// import org.springframework.security.core.GrantedAuthority;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import org.springframework.security.core.userdetails.*;
// import org.springframework.stereotype.Service;
// import java.util.Collections;

// @Service
// public class UserDetailsServiceImpl implements UserDetailsService {
//     private final UserRepository userRepository;
//     public UserDetailsServiceImpl(UserRepository userRepository) {
//         this.userRepository = userRepository;
//     }
//     @Override
//     public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//         User user = userRepository.findByEmail(username)
//             .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
//         GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
//         return new org.springframework.security.core.userdetails.User(
//             user.getEmail(), user.getPassword(), Collections.singletonList(authority)
//         );
//     }
// }
package com.fixitnow.service;

import com.fixitnow.model.User;
import com.fixitnow.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // null-safe role handling
        String roleName = (user.getRole() != null) ? user.getRole().name() : "CUSTOMER";
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + roleName);

        // If you later want to support multiple roles:
        // List<GrantedAuthority> authorities = user.getRoles().stream()
        //     .map(r -> new SimpleGrantedAuthority("ROLE_" + r.name()))
        //     .collect(Collectors.toList());

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPassword())
            .authorities(List.of(authority))
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(false)
            .build();
    }
}
