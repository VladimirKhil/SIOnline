/** Defines a slice of data. Large data array arrives as a set of multiple slices. */
export default interface Slice<T> {
	/** Current data. */
	Data: T[];

	/** Last slice marker. */
	IsLastSlice: boolean;
}
