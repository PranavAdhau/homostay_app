module SeoContentFields
  extend ActiveSupport::Concern

  included do
    serialize :locality_tags, coder: JSON
    serialize :nearby_landmark_tags, coder: JSON
    serialize :related_blog_ids, coder: JSON
    serialize :related_homestay_ids, coder: JSON
    serialize :faq_entries, coder: JSON

    before_validation :normalize_seo_content_fields

    validate :faq_entries_are_valid
  end

  def normalized_locality_tags
    normalize_string_list(locality_tags)
  end

  def normalized_nearby_landmark_tags
    normalize_string_list(nearby_landmark_tags)
  end

  def normalized_related_blog_ids
    normalize_integer_list(related_blog_ids)
  end

  def normalized_related_homestay_ids
    normalize_integer_list(related_homestay_ids)
  end

  def normalized_faq_entries
    normalize_faq_entries(faq_entries)
  end

  private

  def normalize_seo_content_fields
    self.seo_summary =
      seo_summary.to_s.strip.presence if respond_to?(:seo_summary)

    self.featured_locality =
      featured_locality.to_s.strip.presence if respond_to?(:featured_locality)

    self.seo_locality_focus =
      seo_locality_focus.to_s.strip.presence if respond_to?(:seo_locality_focus)

    self.locality_tags =
      normalize_string_list(locality_tags)

    self.nearby_landmark_tags =
      normalize_string_list(nearby_landmark_tags)

    normalized_related_blog_ids =
      normalize_integer_list(related_blog_ids)

    if self.related_blog_ids != normalized_related_blog_ids
      self.related_blog_ids_will_change!
      self.related_blog_ids = normalized_related_blog_ids
    end

    normalized_related_homestay_ids =
      normalize_integer_list(related_homestay_ids)

    if self.related_homestay_ids != normalized_related_homestay_ids
      self.related_homestay_ids_will_change!
      self.related_homestay_ids = normalized_related_homestay_ids
    end

    self.faq_entries =
      normalize_faq_entries(faq_entries)
  end

  def normalize_string_list(value)
    Array(value)
      .flat_map { |item| item.to_s.split(/[\n,]/) }
      .map(&:strip)
      .reject(&:blank?)
      .uniq
  end

  def normalize_integer_list(value)
    values =
      case value
      when nil
        []
      when Array
        value
      when String
        begin
          parsed = JSON.parse(value)
          parsed.is_a?(Array) ? parsed : [parsed]
        rescue JSON::ParserError
          value.split(",")
        end
      when ActionController::Parameters
        value.to_unsafe_h.values
      else
        Array.wrap(value)
      end

    values
      .flatten
      .compact
      .filter_map do |item|
        next if item.blank?

        parsed =
          case item
          when Integer
            item
          when String
            Integer(item, 10)
          else
            Integer(item.to_s, 10)
          end

        parsed if parsed.positive?
      rescue ArgumentError, TypeError
        nil
      end
      .uniq
  end

  def normalize_faq_entries(value)
    Array(value).filter_map do |entry|
      question =
        entry.is_a?(Hash) ? entry["question"] || entry[:question] : nil

      answer =
        entry.is_a?(Hash) ? entry["answer"] || entry[:answer] : nil

      next if question.blank? || answer.blank?

      {
        "question" => question.to_s.strip,
        "answer" => answer.to_s.strip,
      }
    end
  end

  def faq_entries_are_valid
    return if normalized_faq_entries.all? do |entry|
      entry["question"].present? &&
        entry["answer"].present?
    end

    errors.add(
      :faq_entries,
      "must contain a question and answer for each entry",
    )
  end
end
