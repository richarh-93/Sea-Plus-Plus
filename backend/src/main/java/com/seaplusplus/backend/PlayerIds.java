package com.seaplusplus.backend;

import java.util.regex.Pattern;

final class PlayerIds {

    private static final Pattern VALID = Pattern.compile("^[A-Za-z0-9-]{1,64}$");

    static boolean isValid(String id) {
        return id != null && VALID.matcher(id).matches();
    }

    private PlayerIds() {}
}
