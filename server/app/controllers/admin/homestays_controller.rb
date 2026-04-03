class Admin::HomestaysController < Admin::BaseController
  before_action :set_homestay, only: [:show, :edit, :update, :destroy]

  def index
    @homestays = Homestay.all.order(created_at: :desc)
  end

  def show
  end

  def new
    @homestay = Homestay.new
    @amenities = Amenity.all
  end

  def create
    @homestay = Homestay.new(homestay_params)
    @amenities = Amenity.all

    if @homestay.save
      update_amenities
      redirect_to admin_homestay_path(@homestay), notice: 'Homestay was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @amenities = Amenity.all
  end

  def update
    @amenities = Amenity.all

    if @homestay.update(homestay_params)
      update_amenities
      redirect_to admin_homestay_path(@homestay), notice: 'Homestay was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @homestay.destroy
    redirect_to admin_homestays_path, notice: 'Homestay was successfully deleted.'
  end

  private

  def set_homestay
    @homestay = Homestay.find(params[:id])
  end

  def homestay_params
    params.require(:homestay).permit(
      :name,
      :description,
      :capacity,
      :rooms,
      :size,
      :price_per_night,
      :is_active,
      images: [],
      featured_image: []
    )
  end

  def update_amenities
    return unless params[:homestay][:amenity_ids]

    amenity_ids = params[:homestay][:amenity_ids].reject(&:blank?)
    @homestay.amenity_ids = amenity_ids
  end
end
