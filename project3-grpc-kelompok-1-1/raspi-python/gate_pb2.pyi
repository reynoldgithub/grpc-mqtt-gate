from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class KeluarRequest(_message.Message):
    __slots__ = ["idgate", "idkartu"]
    IDGATE_FIELD_NUMBER: _ClassVar[int]
    IDKARTU_FIELD_NUMBER: _ClassVar[int]
    idgate: int
    idkartu: int
    def __init__(self, idkartu: _Optional[int] = ..., idgate: _Optional[int] = ...) -> None: ...

class KeluarResponse(_message.Message):
    __slots__ = ["status"]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    status: int
    def __init__(self, status: _Optional[int] = ...) -> None: ...

class MasukRequest(_message.Message):
    __slots__ = ["idgate", "idkartu"]
    IDGATE_FIELD_NUMBER: _ClassVar[int]
    IDKARTU_FIELD_NUMBER: _ClassVar[int]
    idgate: int
    idkartu: int
    def __init__(self, idkartu: _Optional[int] = ..., idgate: _Optional[int] = ...) -> None: ...

class MasukResponse(_message.Message):
    __slots__ = ["status"]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    status: int
    def __init__(self, status: _Optional[int] = ...) -> None: ...
