/** Allowed join mode. */
enum JoinMode {
	/** Join as any role. */
	AnyRole = 0,

	/** Join only as viewer. */
	OnlyViewer = 1,

	/** Join is forbidden. */
	Forbidden = 2
}

export default JoinMode;