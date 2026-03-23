<?php

namespace App\Helpers;

class InputSanitizer
{
    /**
     * Sanitize a single string value by removing HTML tags and trimming.
     * 
     * @param string|null $value
     * @param array $allowedTags Tags to keep (e.g., ['<b>', '<i>'])
     * @return string|null
     */
    public static function sanitize(?string $value, array $allowedTags = []): ?string
    {
        if ($value === null) {
            return null;
        }

        $allowedTagsString = implode('', $allowedTags);
        return trim(strip_tags($value, $allowedTagsString));
    }

    /**
     * Sanitize an array of values recursively.
     * 
     * @param array $data
     * @param array $allowedTags
     * @return array
     */
    public static function sanitizeArray(array $data, array $allowedTags = []): array
    {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = self::sanitize($value, $allowedTags);
            } elseif (is_array($value)) {
                $data[$key] = self::sanitizeArray($value, $allowedTags);
            }
        }

        return $data;
    }

    /**
     * Sanitize specific fields from a request.
     * 
     * @param array $data
     * @param array $fields Fields to sanitize
     * @param array $allowedTags
     * @return array
     */
    public static function sanitizeFields(array $data, array $fields, array $allowedTags = []): array
    {
        foreach ($fields as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = self::sanitize($data[$field], $allowedTags);
            }
        }

        return $data;
    }

    /**
     * Sanitize all string fields except specified ones.
     * 
     * @param array $data
     * @param array $except Fields to skip (e.g., 'password', 'token')
     * @param array $allowedTags
     * @return array
     */
    public static function sanitizeExcept(array $data, array $except = [], array $allowedTags = []): array
    {
        foreach ($data as $key => $value) {
            if (in_array($key, $except)) {
                continue;
            }

            if (is_string($value)) {
                $data[$key] = self::sanitize($value, $allowedTags);
            } elseif (is_array($value)) {
                $data[$key] = self::sanitizeExcept($value, $except, $allowedTags);
            }
        }

        return $data;
    }
}
